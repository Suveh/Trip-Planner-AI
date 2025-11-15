// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  updateProfile as updateFirebaseProfile,
  updateEmail as updateFirebaseEmail,
  updatePassword as updateFirebasePassword
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../service/firebaseConfig"; // Remove storage import
import { toast } from "sonner";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Fetch user data from Firestore
  const fetchUserData = async (user) => {
    if (!user) {
      setUserData(null);
      return;
    }
    
    try {
      const userRef = doc(db, "Users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error("Failed fetching user data:", err);
      setUserData(null);
    }
  };

  // Save or update user data into Firestore
  const saveUserFirestore = async (user) => {
    if (!user) return;
    try {
      const userRef = doc(db, "Users", user.uid);
      const snap = await getDoc(userRef);
      const payload = {
        id: user.uid,
        email: user.email || null,
        name: user.displayName || null,
        photo: user.photoURL || null,
        provider: user.providerData?.[0]?.providerId || "password",
        updatedAt: new Date().toISOString()
      };
      
      if (!snap.exists()) {
        await setDoc(userRef, { ...payload, createdAt: new Date().toISOString() });
      } else {
        await setDoc(userRef, payload, { merge: true });
      }
      
      // Update userData state after saving
      setUserData(payload);
    } catch (err) {
      console.error("Failed saving user to Firestore:", err);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await saveUserFirestore(user);
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  // Upload profile photo as compressed data URL
  const uploadProfilePhoto = async (userId, file) => {
    try {
      console.log("Compressing image for Firestore storage...");
      
      // Validate file size
      if (file.size > 200 * 1024) {
        throw new Error("Please select an image smaller than 200KB");
      }
      
      return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          const maxSize = 80;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const dataURL = canvas.toDataURL('image/jpeg', 0.6);
          console.log("Compressed image data URL length:", dataURL.length);
          
          if (dataURL.length > 100000) {
            reject(new Error("Image is still too large after compression. Please try a smaller image."));
            return;
          }
          
          resolve(dataURL);
        };
        
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      console.error("Error processing profile photo:", error);
      throw error;
    }
  };

  // ✅ FIXED: Update user profile - ONLY update Firestore, NOT Firebase Auth for photos
  const updateUserProfile = async (profileData) => {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      const userRef = doc(db, "Users", currentUser.uid);
      
      // ✅ ONLY update Firestore with the profile data
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      // ✅ Update local userData state
      setUserData(prev => ({ ...prev, ...profileData }));
      
      // ✅ ONLY update displayName in Firebase Auth (NOT photoURL)
      if (profileData.name) {
        await updateFirebaseProfile(currentUser, {
          displayName: profileData.name
          // ❌ DON'T include photoURL - this causes the error!
        });
        
        // Update currentUser state with name only
        setCurrentUser(prev => ({
          ...prev,
          displayName: profileData.name
        }));
      }
      
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  // Simple update function (your suggested version)
  const updateUserProfileSimple = async (data) => {
    try {
      const userRef = doc(db, "Users", currentUser.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setUserData(prev => ({ ...prev, ...data }));
      
      console.log("Profile updated in Firestore!");
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Failed to update profile");
      throw error;
    }
  };

  // Google popup sign in
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await saveUserFirestore(res.user);
      await fetchUserData(res.user);
      toast.success("Signed in with Google");
      return res;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Google sign in failed");
      throw err;
    }
  };

  // Email/password sign up
  const signInWithEmail = async (email, password) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await saveUserFirestore(res.user);
      await fetchUserData(res.user);
      toast.success("Signed in");
      return res;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Sign in failed");
      throw err;
    }
  };

  // Email/password sign up
  const signUpWithEmail = async (email, password, displayName = null) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateFirebaseProfile(res.user, { displayName });
      }
      await saveUserFirestore(res.user);
      await fetchUserData(res.user);
      toast.success("Account created");
      return res;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Sign up failed");
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to send reset email");
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      toast.success("Signed out");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Sign out failed");
      throw err;
    }
  };

  // Update Firebase Auth profile (basic updates without photos)
  const updateProfile = async (profileData) => {
    try {
      // Only update fields that don't include long data URLs
      const authData = {};
      if (profileData.displayName) authData.displayName = profileData.displayName;
      
      await updateFirebaseProfile(auth.currentUser, authData);
      setCurrentUser({ ...auth.currentUser, ...authData });
      await saveUserFirestore({ ...auth.currentUser, ...authData });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    }
  };

  const updateEmail = async (newEmail) => {
    try {
      await updateFirebaseEmail(auth.currentUser, newEmail);
      toast.success("Email updated successfully!");
    } catch (error) {
      toast.error(`Failed to update email: ${error.message}`);
      throw error;
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      await updateFirebasePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(`Failed to update password: ${error.message}`);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    initializing,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    logout,
    updateProfile,
    updateEmail,
    updatePassword,
    uploadProfilePhoto,
    updateUserProfile: updateUserProfileSimple, // Use the simple version
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
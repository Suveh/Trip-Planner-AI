// src/components/auth/Profile.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { AiOutlineLoading3Quarters, AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";


export default function Profile() {
  const { currentUser, userData, uploadProfilePhoto, updateUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(userData?.name || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [bio, setBio] = useState(userData?.bio || "");
  const [photoPreview, setPhotoPreview] = useState(userData?.photo || "");
  const [photoFile, setPhotoFile] = useState(null);
  const navigate = useNavigate();



  // In Profile.jsx - Update handlePhotoChange
const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file size
    if (file.size > 200 * 1024) {
      alert("Please select an image smaller than 200KB for better performance");
      e.target.value = "";
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      e.target.value = "";
      return;
    }
    
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }
};
// In Profile.jsx - Update the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);
    
    let photoURL = userData?.photo || currentUser?.photoURL || "";
    
    // If user selected a new profile picture, use data URL
    if (photoFile) {
      console.log("Converting image to data URL...");
      photoURL = await uploadProfilePhoto(currentUser.uid, photoFile);
      console.log("Image converted successfully - no Storage used");
    }

    console.log("Updating profile in Firestore...");
    // Update Firestore user profile - image is stored as base64 string
    await updateUserProfile({
      name,
      phone,
      bio,
      photo: photoURL, // This is now a data URL like "data:image/jpeg;base64,..."
    });

    alert("Profile updated successfully! ✅");
    navigate("/");
    
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Error updating profile: " + error.message);
  } finally {
    setLoading(false);
  }
};

  // ✅ Add loading state while userData is being fetched
  if (!userData && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <AiOutlineLoading3Quarters className="animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-300 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        
        <h2 className="text-2xl font-bold text-center mb-6">Edit Profile</h2>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={
                photoPreview ||
                userData?.photo ||
                currentUser?.photoURL ||
                `https://ui-avatars.com/api/?name=${name || currentUser?.email || 'User'}&background=3B82F6&color=fff`
              }
              alt="Profile"
              className="h-28 w-28 rounded-full object-cover border-2 border-gray-300"
            />

            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <AiOutlineCamera className="text-lg" />
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-gray-500 text-sm mt-2">Tap to change photo</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="font-medium text-sm block mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="font-medium text-sm block mb-1">Phone</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="font-medium text-sm block mb-1">Bio</label>
            <textarea
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full !bg-green-700 text-white py-3 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading && <AiOutlineLoading3Quarters className="animate-spin mr-2" />}
            {loading ? "Updating..." : "Save Changes"}
          </button>

        </form>
      </div>
    </div>
  );
}
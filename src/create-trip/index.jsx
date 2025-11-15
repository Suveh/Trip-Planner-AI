//index.jsx
import { React, useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/button';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelList } from '../constants/options'
import { toast } from 'sonner';
import { chatSession } from '@/service/AIModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, } from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AiOutlineLoading3Quarters, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { setDoc, doc } from "firebase/firestore";
import { db, auth } from '../service/firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { TfiEmail } from "react-icons/tfi";
import { RxCross2 } from "react-icons/rx";
//import { X } from "lucide-react";
//import { Description } from '@radix-ui/react-dialog';
//import { Input } from '../components/ui/input';


function CreateTrip() {
  const [place, setPlace] = useState(null);
  const [formData, setFormData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [authError, setAuthError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate =useNavigate();

  
  const handleSignIn = () => {
    const email = emailInputRef.current.value;
    const password = passwordInputRef.current.value;
    if (!email.includes('@') || !email.includes('.')) {
      setAuthError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    setAuthError(null); // Clear previous errors
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        clearAuthFields()
        const user = userCredential.user;
        localStorage.setItem('user', JSON.stringify({
          email: user.email,
          uid: user.uid
        }));
        setOpenDialog(false); 
        toast.success("Signed in successfully!");
      })
      .catch((error) => {
        const firebaseError = error.code ? error : {
          code: error?.response?.data?.error?.code || 'unknown',
          message: error?.response?.data?.error?.message || error.message
        };
        const errorMap = {
          'auth/invalid-email': 'Please enter a valid email address.',
          'auth/user-disabled': 'This account has been disabled.',
          'auth/user-not-found': 'No account found with this email.',
          'auth/wrong-password': 'Incorrect password.',
          'auth/email-already-in-use': 'This email is already registered.',
          'auth/weak-password': 'Password must be at least 6 characters.',
          'auth/invalid-credential': 'Invalid email or password combination.',
          'auth/too-many-requests': 'Too many attempts. Please try again later.',
          'auth/operation-not-allowed': 'Email/password login is not enabled.'
        };
        const errorMessage = errorMap[firebaseError.code] ||  firebaseError.message.replace('Firebase: ', '');
        setAuthError(errorMessage);
        toast.error(errorMessage, {
          description: '',
          duration: 5000
        });
      });
  }
  
  const handleSignUp = async () => {
    const email = emailInputRef.current.value;
    const password = passwordInputRef.current.value;
    if (!email || !password) {
      toast.warning("Please enter both email and password");
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setAuthError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    setEmailLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        uid: user.uid
      }));
      toast.success("Account created successfully!");
      clearAuthFields();
      setOpenDialog(false);
    } catch (error) {
      setAuthError(error.message);
      toast.error(error.message);
    } finally {
      setEmailLoading(false);
    }
  }

  const clearAuthFields = () => {
    emailInputRef.current.value = '';
    passwordInputRef.current.value = '';
    setAuthError(null);
  }

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData);
  }, [formData])

  const login = useGoogleLogin({
    onSuccess: (codeResp) => {
      GetUserProfile(codeResp);
      console.log(codeResp);
    },
    onError: (error) => console.log(error)
  })

  const OnGenerateTrip = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setOpenDialog(true)
      return;
    }
    if (formData?.noOfDays > 5 && !formData?.location || !formData?.budget || !formData?.traveler) {
      toast("Please fill all details")
      return;
    }
    setLoading(true);
    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData?.location?.label)
      .replace('{totalDays}', formData?.noOfDays)
      .replace('{traveler}', formData?.traveler)
      .replace('{budget}', formData?.budget)
      .replace('{totalDays}', formData?.noOfDays)
    const result = await chatSession.sendMessage(FINAL_PROMPT);
    console.log("--", result?.response?.text());
    setLoading(false);
    SaveAiTrip(result?.response?.text())
  }

const SaveAiTrip = async (TripData) => {
  setLoading(true);
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const docId = Date.now().toString();
    
    // ✅ ADD tripName based on the destination
    const tripDoc = {
      userSelection: formData,
      tripData: TripData,
      userEmail: user?.email,
      id: docId,
      createdAt: new Date().toISOString(),
      tripName: `Trip to ${formData?.location?.label || 'Unknown Destination'}`,
      destination: formData?.location?.label // ✅ Also add destination for better display
    };

    console.log("💾 Saving trip to Firestore:", tripDoc);
    
    await setDoc(doc(db, "AiTrips", docId), tripDoc);
    
    console.log("✅ Trip saved successfully with ID:", docId);
    toast.success("Trip generated successfully!");
    navigate('/view-trip/'+ docId);
  } catch (error) {
    console.error("❌ Error saving trip:", error);
    toast.error("Failed to save trip");
  } finally {
    setLoading(false); 
  }
}

  const GetUserProfile = async (tokenInfo) => {
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenInfo?.access_token}`, {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: 'application/json',
        },
      });
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      await setDoc(doc(db, "Users", user.id), {
        email: user.email,
        name: user.name,
        picture: user.picture,
        id: user.id,
        provider: 'google',
      });
      setOpenDialog(false);
      OnGenerateTrip();
    } catch (error) {
      console.error("Google login error", error);
      toast.error("Failed to login with Google");
    }
  };
  

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10 text-center flex flex-col items-center justify-start w-full'>
      <h2 className='font-bold text-3xl text-red-700'>Tell us your travel preferences⛺🏖️</h2>
      <p className='mt-3 text-black text-xl'>
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>
      <div className='mt-20 flex flex-col gap-10'>
        <div>
          <h2 className='text-xl  font-medium my-3 text-blue-900'>What is destination of choice ?</h2>
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
            selectProps={{
              place,
              onChange: (v) => { setPlace(v); handleInputChange('location', v) },
              styles: {
                control: (provided, state) => ({
                  ...provided,
                  borderWidth: '2px',
                  borderColor: state.isFocused ? '#1e40af' : '#d1d5db', '&:hover': {
                    borderColor: '#1e40af'
                  },
                  boxShadow: 'none'
                })
              },
            }
            }
          />
        </div>
        <div>
          <h2 className='text-xl my-3 font-medium text-blue-900'>How many days are you planning your trip ? </h2>
          <input placeholder={'Ex:3'}
            type="number"
            className=" p-3 border-2 rounded border-gray-300  hover:border-blue-900 focus:border-blue-900 transition-all duration-200"
            onChange={(e) => handleInputChange('noOfDays', e.target.value)} />
        </div>
        <div>
          <h2 className='text-xl my-3 font-medium text-blue-900'>What is your budget ?</h2>
          <div className='grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-5'>
            {SelectBudgetOptions.map((item, index) => (
              <div key={index}
                onClick={() => handleInputChange('budget', item.title)}
                className={`p-4 border-2 cursor-pointer rounded-lg  hover:shadow-lg hover:border-blue-900
                  ${formData?.budget == item.title && 'shadow-lg border-blue-900'}`
                } >
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg text-red-700'>{item.title}</h2>
                <p className='text-sm text-black'>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className='text-xl my-3 font-medium text-blue-900'>Who do you plan on your next adventure ?</h2>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5'>
          {SelectTravelList.map((item, index) => (
            <div key={index}
              onClick={() => handleInputChange('traveler', item.people)}
              className={`p-4 border-2 cursor-pointer rounded-lg  hover:shadow-lg hover:border-blue-900
                ${formData?.traveler == item.people && 'shadow-lg border-blue-900'}`
              } >
              <h2 className='text-4xl'>{item.icon}</h2>
              <h2 className='font-bold text-lg  text-red-700'>{item.title}</h2>
              <p className='text-sm text-black'>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className='justify-end my-10 text-white'>
        <Button
          disabled={loading}
          onClick={OnGenerateTrip}
          className={`bg-gradient-to-b from-red-700 to-red-800 text-white px-6 py-3 rounded-lg
                      border-b-4 border-red-900 shadow-[0_4px_0_rgb(127,29,29)] hover:from-red-600 hover:to-red-700
                      hover:border-b-2 hover:shadow-[0_2px_0_rgb(127,29,29)] hover:translate-y-0.5
                      active:from-red-800 active:to-red-900 active:border-b-0 active:shadow-none active:translate-y-1.5
                      transition-all duration-75 transform origin-bottom  ${loading ? 'translate-y-1.5 shadow-none border-b-0' : ''}`}>
          {loading ?
            <AiOutlineLoading3Quarters className='h-7 w-7 animate-spin' /> : ''}
          Generate Trip</Button>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog} >
        <DialogContent className=" relative" >                 
          <DialogHeader>
            <DialogTitle> <center><h2 className='font-bold text-lg text-blue-700 mt-3'>Sign In </h2></center></DialogTitle>
            <DialogDescription>
              <div className="mt-5 space-y-4">
                {}
                <div className="space-y-3">
                  <input
                    type="email"
                    ref={emailInputRef}
                    placeholder="Email"
                    className="w-full p-3 border  rounded-lg text-black border-gray-300 hover:border-blue-700  focus:border-blue-700"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      ref={passwordInputRef}
                      placeholder="Password"
                      className="w-full p-3 border rounded-lg pr-10  text-black border-gray-300 hover:border-blue-700 focus:border-blue-700"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2 text-black !bg-white h-5 w-5 !outline-none !ring-0 !ring-offset-0 !border-0 focus-visible:!outline-none hover:!outline-none  appearance-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                  {authError && (
                    <p className="text-red-500 text-sm">{authError}</p>
                  )}
                  <Button
                    onClick={handleSignIn}
                    className="!bg-blue-700 text-white cursor-pointer rounded-lg  hover:shadow-lg hover:border-blue-700 !outline-none !ring-0 !ring-offset-0 !border-0 focus-visible:!outline-none hover:!outline-none"
                    disabled={emailLoading}
                  >
                    {emailLoading && <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 !bg-white" />}
                    <TfiEmail />Sign In With Email
                  </Button>
                  <div className="flex justify-between ">
                    <button
                      onClick={() => {
                        if (emailInputRef.current.value) {
                          setResetLoading(true);
                          sendPasswordResetEmail(auth, emailInputRef.current.value)
                            .then(() => toast.success("Password reset email sent!"))
                            .catch((error) => toast.error(error.message))
                            .finally(() => setResetLoading(false));
                        } else {
                          toast.warning("Please enter your email first");
                        }
                      }}
                      className="text-blue-700 text-sm hover:underline !bg-white !outline-none !ring-0 !ring-offset-0 !border-0 focus-visible:!outline-none hover:!outline-none"
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Sending..." : "Forgot password?"}
                    </button>
                  </div>
                </div>
                {}
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t "></div>
                  <span className="mx-4 text-black">OR</span>
                  <div className="flex-grow border-t "></div>
                </div>
                {}
                <Button
                  onClick={login}
                  className="w-full flex gap-4 items-center justify-center  !bg-blue-700 text-white !outline-none !ring-0 !ring-offset-0 !border-0 focus-visible:!outline-none hover:!outline-none cursor-pointer rounded-lg  hover:shadow-lg hover:border-blue-900"
                >
                  <FcGoogle className='h-6 w-6' />
                  Sign In With Google
                </Button>
                <div className="text-center text-sm mt-4 text-black">
                  Don't have an account?{' '}
                  <br></br>
                  <button
                    onClick={handleSignUp}
                    disabled={emailLoading}
                    className="text-blue-700 font-bold hover:underline !bg-white mt-5 !outline-none !ring-0 !ring-offset-0 !border-0 focus-visible:!outline-none hover:!outline-none"
                  >
                     {emailLoading && <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />}
                    Sign up
                  </button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip
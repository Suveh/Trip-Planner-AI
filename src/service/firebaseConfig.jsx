//firebaseConfig.jsx
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGbQ6v2bkaqdMPrp22v6U_jC8kK6FqLLs",
  authDomain: "trip-planner-aeacf.firebaseapp.com",
  projectId: "trip-planner-aeacf",
  storageBucket: "trip-planner-aeacf.firebasestorage.app",
  messagingSenderId: "740913295269",
  appId: "1:740913295269:web:75c0608780ca34669b824c",
  measurementId: "G-RCJK1PNNVS"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

//const analytics = getAnalytics(app);
export { app };
export { db };
export { auth };
export { storage };


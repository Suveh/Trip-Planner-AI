// File: Trip_Planner/src/view-trip/index.jsx
import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { db } from '../service/firebaseConfig';
import InfoSection from './components/infoSection';
import Hotels from './components/Hotels';
import PlacesToVisit from './components/PlacesToVisit';

function Viewtrip() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null); // ✅ Change from [] to null

  useEffect(() => {
    tripId && GetTripData();
  }, [tripId])

  const GetTripData = async () => {
    try {
      const docRef = doc(db, 'AiTrips', tripId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        setTrip(docSnap.data()); // ✅ This returns an object, not array
      } else {
        console.log("No such Document");
        toast.error(`No trip found with ID: ${tripId}`);
      }
    } catch (error) {
      console.error("Firestore error:", error);
      toast.error(`Error loading trip: ${error.message}`);
    }
  }

  // ✅ Add loading state
  if (!trip) {
    return (
      <div className='p-10 md:px-20 lg:px-44 xl:px-56 flex justify-center items-center min-h-96'>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      {/*Information section */}
      <InfoSection trip={trip}/>

      {/*Recommended Hotels */}
      <Hotels trip={trip} />

      {/*Daily Plans */}
      <PlacesToVisit trip={trip} />
    </div>
  )
}

export default Viewtrip
//myTrips/MyTrips.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../service/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Calendar, MapPin, Trash2, Eye, Plus, Loader } from "lucide-react";

export default function MyTrips() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingTripId, setDeletingTripId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      // ✅ FIXED COLLECTION NAME + FIELD NAME
      const q = query(
        collection(db, "AiTrips"),
        where("userEmail", "==", currentUser.email)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTrips(list);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Firestore error:", err);
          setError("Failed to load trips. Please try again.");
          setLoading(false);
          toast.error("Error loading trips");
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up Firestore listener:", err);
      setError("Failed to connect to database.");
      setLoading(false);
    }
  }, [currentUser]);

  const handleDeleteTrip = async (tripId, tripName) => {
    if (!confirm(`Are you sure you want to delete "${tripName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingTripId(tripId);
    try {
      // ❗ Must also delete from AiTrips
      await deleteDoc(doc(db, "AiTrips", tripId));

      toast.success("Trip deleted successfully");
    } catch (err) {
      console.error("Error deleting trip:", err);
      toast.error("Failed to delete trip");
    } finally {
      setDeletingTripId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Sign In Required</h2>
            <p className="text-yellow-700 mb-4">Please sign in to view your trips</p>
            <Link
              to="/login"
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors inline-block"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Trips</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-gray-200 p-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Trips Yet</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Start planning your next adventure! Create your first trip to get started.
            </p>
            <Link
              to="/create-trip"
              className="bg-blue-600 !text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Create Your First Trip
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
            <p className="text-gray-600 mt-2">
              You have {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
            </p>
          </div>
          <Link
            to="/create-trip"
            className="bg-green-500 !text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            New Trip
          </Link>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Cover Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                {trip.coverPhoto ? (
                  <img
                    src={trip.coverPhoto}
                    alt="Trip cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Calendar size={48} className="opacity-50" />
                  </div>
                )}
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteTrip(trip.id, trip.tripName || "Unnamed Trip")}
                  disabled={deletingTripId === trip.id}
                  className="absolute top-3 right-3 p-2 !bg-white bg-opacity-90 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-opacity-100 disabled:opacity-50"
                  title="Delete trip"
                >
                  {deletingTripId === trip.id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>

              {/* Trip Info */}
              <div className="p-6">
                <h4 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
  {trip.tripName || `Trip to ${trip.destination || trip.userSelection?.location?.label || 'Unknown'}`}
</h4>

                <div className="space-y-2 mb-4">
                  {trip.destination && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-2" />
                      <span className="line-clamp-1">{trip.destination}</span>
                    </div>
                  )}
                  
                  {(trip.startDate || trip.endDate) && (
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar size={16} className="mr-2" />
                      <span>
                        {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Created {formatDate(trip.createdAt)}
                  </span>
                  <Link
                    to={`/view-trip/${trip.id}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

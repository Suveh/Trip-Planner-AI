// File: Trip_Planner/src/view-trip/components/Hotels.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import HotelCardItem from "./HotelCardItem";

// Utility function to parse trip data
const parseTripData = (trip) => {
  if (!trip) return null;

  try {
    if (trip.tripData) {
      if (typeof trip.tripData === 'string') {
        let jsonString = trip.tripData;
        // Handle markdown code blocks
        if (jsonString.includes("```json")) {
          const jsonStart = jsonString.indexOf("{");
          const jsonEnd = jsonString.lastIndexOf("}") + 1;
          jsonString = jsonString.slice(jsonStart, jsonEnd);
        }
        return JSON.parse(jsonString);
      }
      return trip.tripData;
    }
    return trip;
  } catch (error) {
    console.error("Failed to parse trip data:", error);
    throw error;
  }
};

function Hotels({ trip }) {
  // Memoized fallback image
  const fallbackImage = useMemo(() => (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23666' text-anchor='middle' dominant-baseline='middle'%3EHotel Image%3C/text%3E%3C/svg%3E"
  ), []);

  // Parse trip data with memoization
  const tripData = useMemo(() => {
    try {
      return parseTripData(trip);
    } catch (error) {
      return null;
    }
  }, [trip]);

  // Get hotel list with fallbacks
  const hotelList = useMemo(() => {
    if (!tripData) return [];
    return tripData.hotels || tripData.hotelOptions || [];
  }, [tripData]);

  // No trip data case
  if (!trip) {
    return (
      <div className="p-5 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-medium text-blue-800">No trip data available</h2>
        <p className="text-blue-600">Please select a trip to view hotel recommendations</p>
      </div>
    );
  }

  // Error case
  if (!tripData) {
    return (
      <div className="p-5 bg-red-50 rounded-lg">
        <h2 className="text-lg font-medium text-red-800" role="alert">
          Error processing trip data
        </h2>
        <p className="text-red-600">We couldn't read the trip information. Please try again.</p>
      </div>
    );
  }

  // Empty hotel list case
  if (!hotelList.length) {
    return (
      <div className="p-5 bg-yellow-50 rounded-lg">
        <h2 className="text-lg font-medium text-yellow-800">No hotels available</h2>
        <p className="text-yellow-600">
          We couldn't find any hotel recommendations for this trip.
          <Link to="/hotels" className="text-blue-600 hover:underline ml-1">
            Browse hotels
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="font-bold text-xl mt-5 mb-4 text-blue-900">Hotel Recommendations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hotelList.map((hotel, index) => {
          if (!hotel || typeof hotel !== 'object') {
            console.warn('Invalid hotel data at index:', index, hotel);
            return null;
          }
          
          return (
            <HotelCardItem 
              key={`hotel-${index}-${hotel.hotelName || index}`}
              hotel={hotel}
              fallbackImage={fallbackImage}
            />
          );
        })}
      </div>
    </div>
  );
}

Hotels.propTypes = {
  trip: PropTypes.oneOfType([
    PropTypes.shape({
      tripData: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
      ]),
      hotels: PropTypes.array,
      hotelOptions: PropTypes.array
    }),
    PropTypes.object
  ])
};


export default Hotels;
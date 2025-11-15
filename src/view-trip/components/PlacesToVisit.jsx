// File: Trip_Planner/src/view-trip/components/PlacesToVisit.jsx
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PlaceCardItem from './PlaceCardItem';
import { getPlaceImage, getRandomImage } from '../../lib/imageFallbacks'; // ✅ Import your image functions

const generatePlaceholderImage = (placeName = 'Place') => {
  const colors = ['#f5f5f5', '#e5f5f9', '#f0f0f0', '#f7f7f7'];
  const color = colors[placeName.length % colors.length];
  const displayName = placeName.substring(0, 20);

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23666' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(displayName)}%3C/text%3E%3C/svg%3E`;
};

// ✅ Use your Unsplash API instead of source.unsplash.com
const getFallbackImageUrl = async (placeName, placeType = '') => {
  try {
    // Use your proper Unsplash API function
    const imageUrl = await getPlaceImage(placeName, placeType);
    return imageUrl;
  } catch (error) {
    // Fallback to random image
    const randomImage = await getRandomImage(placeName, 'place');
    return randomImage;
  }
};

const isValidUrl = (url) => {
  return typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');
};

// ✅ Enhanced normalize function with async image loading
const normalizeActivity = async (activity) => {
  const placeName = activity.placeName || 'Unnamed Location';
  const placeType = activity.placeType || activity.category || '';
  const originalUrl = activity.placeImageUrl;
  
  // Check if we have a valid original URL
  let validImageUrl = isValidUrl(originalUrl) ? originalUrl : null;
  
  // If no valid URL, use our Unsplash API
  if (!validImageUrl) {
    validImageUrl = await getFallbackImageUrl(placeName, placeType);
  }

  return {
    placeName,
    placeDetails: activity.placeDetails || 'No description available',
    ticketPricing: activity.ticketPricing || 'Free entry',
    rating: activity.rating || 'Not rated',
    timeSlot: activity.timeSlot || '',
    duration: activity.duration || activity.timeTravel || '',
    timeTravel: activity.timeTravel || activity.travelSuggestion || '',
    bestTimeToVisit: activity.bestTimeToVisit || activity.timeAllocation || '',
    placeImageUrl: validImageUrl,
    travelTime: activity.travelTime || activity.travelTimeToNext || '',
    originalImageUrl: originalUrl,
    placeType: placeType,
    suggestedDuration: activity.suggestedDuration || activity.timeAllocation || ''
  };
};

// ✅ Async normalize day function
const normalizeDay = async (dayData, dayNumber) => {
  const activities = Array.isArray(dayData)
    ? dayData
    : dayData.schedule || dayData.plan || dayData.daily_plan || dayData.dailyPlan || [];

  // Normalize all activities concurrently
  const normalizedActivities = await Promise.all(
    activities.map(activity => normalizeActivity(activity))
  );

  return {
    day: dayNumber || dayData.day || 1,
    theme: dayData.theme || '',
    bestTimeToVisit: dayData.bestTimeToVisit || '',
    plan: normalizedActivities
  };
};

// ✅ Async normalize itinerary function
const normalizeItinerary = async (itinerary) => {
  if (!itinerary) return [];

  // Handle array format
  if (Array.isArray(itinerary)) {
    const normalizedDays = await Promise.all(
      itinerary.map(day => normalizeDay(day, day.day))
    );
    return normalizedDays;
  }

  // Handle object with day properties
  if (typeof itinerary === 'object') {
    const dayEntries = Object.entries(itinerary)
      .filter(([key]) => key.startsWith('day'))
      .map(([key, dayData]) => normalizeDay(dayData, parseInt(key.replace('day', ''))));

    const normalizedDays = await Promise.all(dayEntries);
    return normalizedDays.sort((a, b) => a.day - b.day);
  }

  return [];
};

const removeDuplicateActivities = (days) => {
  const seenActivities = new Set();

  return days.map(day => {
    const uniqueActivities = day.plan.filter(activity => {
      const key = `${day.day}-${activity.placeName}-${activity.timeSlot}`;
      if (seenActivities.has(key)) return false;
      seenActivities.add(key);
      return true;
    });

    return { ...day, plan: uniqueActivities };
  });
};

function PlacesToVisit({ trip }) {
  const [failedImages, setFailedImages] = useState(new Set());
  const [itineraryDays, setItineraryDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Process trip data on component mount
  useMemo(() => {
    const processTripData = async () => {
      if (!trip) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Parse trip data
        let tripData;
        let jsonString = trip.tripData || JSON.stringify(trip);

        // Clean JSON string if it contains markdown code blocks
        if (jsonString.includes("```json")) {
          jsonString = jsonString.substring(jsonString.indexOf("{"));
          jsonString = jsonString.substring(0, jsonString.lastIndexOf("}") + 1);
        }

        tripData = JSON.parse(jsonString);

        // Normalize itinerary with async image loading
        const normalizedItinerary = await normalizeItinerary(tripData.itinerary);
        const uniqueItinerary = removeDuplicateActivities(normalizedItinerary);
        
        setItineraryDays(uniqueItinerary);
      } catch (error) {
        console.error("Failed to process trip data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    processTripData();
  }, [trip]);

  const handleImageError = (dayIndex, activityIndex) => {
    setFailedImages(prev => new Set(prev).add(`${dayIndex}-${activityIndex}`));
  };

  const getActivityImage = (activity, dayIndex, activityIndex) => {
    return failedImages.has(`${dayIndex}-${activityIndex}`)
      ? generatePlaceholderImage(activity.placeName)
      : activity.placeImageUrl;
  };

  const enhanceActivityData = (activity, dayIndex, activityIndex) => {
    return {
      ...activity,
      imageUrl: getActivityImage(activity, dayIndex, activityIndex),
      metadata: {
        timeSlot: activity.timeSlot,
        ticketPricing: activity.ticketPricing,
        rating: activity.rating,
        duration: activity.duration,
        bestTimeToVisit: activity.bestTimeToVisit,
        travelTime: activity.travelTime || activity.timeTravel
      }
    };
  };

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-blue-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-blue-200 rounded"></div>
            <div className="h-4 bg-blue-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-bold">Error Processing Trip Data</h3>
        <p className="text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  if (!trip) {
    return <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">No trip data available</div>;
  }

  if (itineraryDays.length === 0) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-blue-800">No Itinerary Found</h3>
        <p>We couldn't find any itinerary data in your trip information.</p>
      </div>
    );
  }

  return (
    <div className="p-5">
      <h2 className="font-bold text-xl mb-5 text-blue-900">Places to Visit</h2>
      {itineraryDays.map((day, dayIndex) => (
        <div key={`day-${day.day}`} className="border border-gray-200 rounded-lg p-5 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-blue-900">Day {day.day}</h3>
            {day.theme && (
              <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {day.theme}
              </span>
            )}
          </div>

          {day.bestTimeToVisit && (
            <p className="text-sm text-gray-600 mb-3">
              <span role="img" aria-label="Best time">⏰</span> Best time to visit: {day.bestTimeToVisit}
            </p>
          )}

          <div className="flex flex-col gap-5">
            {day.plan.map((activity, activityIndex) => (
              <PlaceCardItem
                key={`activity-${day.day}-${activityIndex}`}
                place={enhanceActivityData(activity, dayIndex, activityIndex)}
                isLast={activityIndex === day.plan.length - 1}
                onImageError={() => handleImageError(dayIndex, activityIndex)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

PlacesToVisit.propTypes = {
  trip: PropTypes.shape({
    tripData: PropTypes.string,
    itinerary: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ])
  })
};

export default PlacesToVisit;
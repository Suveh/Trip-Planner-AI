// InfoSection.jsx
import React, { useState, useEffect } from 'react'; 
import { RiShareForwardFill } from "react-icons/ri";
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';
import { getDestinationImage, getRandomImage } from '../../lib/imageFallbacks';
import { toast } from 'sonner';

function InfoSection({ trip = {} }) {
  const [placePhoto, setPlacePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    const loadDestinationImage = async () => {
      if (!trip?.userSelection?.location?.label) {
        setPlacePhoto('/placeholder.jpg');
        return;
      }

      setLoading(true);
      setError(null);

      const locationName = trip.userSelection.location.label;
      
      try {
        // ✅ Use async image loading with proper await
        const imageSources = [
          await getDestinationImage(locationName), // ✅ Primary static image
          await getRandomImage(locationName, 'destination'), // ✅ Fallback with type
          '/placeholder.jpg' // ✅ Final fallback
        ].filter(Boolean);

        let currentIndex = 0;

        const tryNextImage = async () => {
          if (currentIndex >= imageSources.length) {
            setPlacePhoto('/placeholder.jpg');
            setError('Could not load destination image');
            setLoading(false);
            return;
          }

          const imageUrl = imageSources[currentIndex];
          
          try {
            const loaded = await new Promise((resolve) => {
              const img = new Image();
              img.src = imageUrl;
              img.onload = () => resolve(imageUrl);
              img.onerror = () => resolve(null);
              
              // Timeout after 5 seconds
              setTimeout(() => resolve(null), 5000);
            });

            if (loaded) {
              setPlacePhoto(loaded);
              setLoading(false);
              return;
            }
          } catch {
            // Continue to next image
          }

          currentIndex++;
          await tryNextImage();
        };

        await tryNextImage();
      } catch (error) {
        console.error('Error loading destination image:', error);
        setPlacePhoto('/placeholder.jpg');
        setError('Failed to load destination image');
        setLoading(false);
      }
    };

    loadDestinationImage();
  }, [trip]);

  // Convert string to number for noOfDays and traveler
  const locationName = trip?.userSelection?.location?.label || 'Travel destination';
  const days = parseInt(trip?.userSelection?.noOfDays) || 0;
  const budget = trip?.userSelection?.budget || 'Not specified';
  const travelers = parseInt(trip?.userSelection?.traveler) || 0;

  const handleShare = async () => {
    setShareLoading(true);
    
    try {
      // Create share data
      const shareData = {
        title: `My Trip to ${locationName}`,
        text: `Check out my ${days}-day trip to ${locationName} for ${travelers} traveler${travelers !== 1 ? 's' : ''} with a ${budget} budget!`,
        url: window.location.href,
      };

      // Check if Web Share API is supported (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Trip shared successfully!');
      } 
      // Fallback for desktop - copy to clipboard
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Trip link copied to clipboard!');
      } 
      // Final fallback
      else {
        // Show share options modal or fallback UI
        toast.info('Share this trip link: ' + window.location.href);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share trip');
      }
    } finally {
      setShareLoading(false);
    }
  };

  const handleAdvancedShare = () => {
    const tripDetails = `
🌍 Trip to ${locationName}

📅 Duration: ${days} day${days !== 1 ? 's' : ''}
👥 Travelers: ${travelers}
💰 Budget: ${budget}
🔗 View full itinerary: ${window.location.href}

Happy travels! ✈️
    `.trim();

    // Copy detailed message to clipboard
    navigator.clipboard.writeText(tripDetails)
      .then(() => {
        toast.success('Trip details copied to clipboard!');
      })
      .catch(() => {
        toast.info(`Share this trip:\n${tripDetails}`);
      });
  };

  return (
    <div className="space-y-4">
      <div className='relative h-[340px] w-full rounded-lg overflow-hidden bg-gray-200'>
        {loading ? (
          <div className='h-full w-full flex items-center justify-center bg-gray-200'>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading destination image...</p>
            </div>
          </div>
        ) : error ? (
          <div className='h-full w-full flex items-center justify-center bg-gray-200'>
            <div className="text-center text-gray-600">
              <p>🚫 {error}</p>
              <p className="text-sm mt-1">Using placeholder image</p>
            </div>
          </div>
        ) : (
          <img 
            src={placePhoto || '/placeholder.jpg'} 
            alt={locationName}
            className='h-full w-full object-cover'
            loading="lazy"
            onError={(e) => {
              // If image fails to load, show placeholder
              e.target.src = '/placeholder.jpg';
            }}
          />
        )}
      </div>
      
      <div className='flex justify-between items-center'>
        <div className='my-5 flex flex-col gap-2'>
          <h2 className='font-bold text-2xl text-blue-900'>{locationName}</h2>
          <div className='flex gap-2 flex-wrap'>
            <span className='p-1 px-3 bg-gray-200 rounded-full text-black text-sm md:text-md'>
              <span role="img" aria-label="Duration">📅</span> {days} Day{days !== 1 ? 's' : ''}
            </span>
            <span className='p-1 px-3 bg-gray-200 rounded-full text-black text-sm md:text-md'>
              <span role="img" aria-label="Budget">💲</span> {budget}
            </span>
            <span className='p-1 px-3 bg-gray-200 rounded-full text-black text-sm md:text-md'>
              <span role="img" aria-label="Travelers">🥂</span> {travelers} Traveler{travelers !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Enhanced Share Button with Dropdown */}
        <div className="relative group">
          <Button 
            onClick={handleShare}
            disabled={shareLoading}
            className='!bg-blue-900 text-white hover:!bg-blue-800 transition-colors'
            aria-label="Share trip details"
          >
            {shareLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RiShareForwardFill />
            )}
          </Button>
          
          {/* Dropdown for advanced sharing options */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <button
              onClick={handleShare}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg flex items-center gap-2"
            >
              <RiShareForwardFill className="text-blue-900" />
              Share via...
            </button>
            <button
              onClick={handleAdvancedShare}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg flex items-center gap-2 border-t border-gray-100"
            >
              <span role="img" aria-label="Copy">📋</span>
              Copy trip details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

InfoSection.propTypes = {
  trip: PropTypes.shape({
    userSelection: PropTypes.shape({
      location: PropTypes.shape({
        label: PropTypes.string
      }),
      noOfDays: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ]),
      budget: PropTypes.string,
      traveler: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
      ])
    })
  })
};

export default InfoSection;
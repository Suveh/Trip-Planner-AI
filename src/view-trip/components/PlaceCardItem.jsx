// File: Trip_Planner/src/view-trip/components/PlaceCardItem.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getPlaceImage, getRandomImage } from '../../lib/imageFallbacks'; // ✅ Import image functions

const generatePlaceholderImage = (placeName = 'Place') => {
    const colors = ['#f5f5f5', '#e5f5f9', '#f0f0f0', '#f7f7f7'];
    const color = colors[placeName.length % colors.length];
    const displayName = placeName.substring(0, 20);

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23666' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(displayName)}%3C/text%3E%3C/svg%3E`;
};

const PlaceCardItem = ({ place, isLast, onImageError }) => {
    const [currentImage, setCurrentImage] = useState(place.imageUrl || '');
    const [imageStatus, setImageStatus] = useState('loading');
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 2; // Reduced from 3 to 2 for better UX

    // ✅ Enhanced image loading with Unsplash API fallback
    const loadImage = useCallback(async (imageUrl, placeName, placeType = '') => {
        if (retryCount >= MAX_RETRIES) {
            setCurrentImage(generatePlaceholderImage(placeName));
            setImageStatus('error');
            onImageError?.();
            return;
        }

        try {
            // If no image URL provided or previous URL failed, use Unsplash API
            let imageToLoad = imageUrl;
            
            if (!imageToLoad || retryCount > 0) {
                // Try to get a better image from Unsplash on retry
                imageToLoad = await getPlaceImage(placeName, placeType);
            }

            const img = new Image();
            img.src = imageToLoad;

            await new Promise((resolve, reject) => {
                img.onload = () => resolve(imageToLoad);
                img.onerror = reject;
                
                // Timeout after 8 seconds
                setTimeout(() => reject(new Error('Image loading timeout')), 8000);
            });

            setCurrentImage(imageToLoad);
            setImageStatus('loaded');
        } catch (error) {
            console.log(`Image load attempt ${retryCount + 1} failed:`, error);
            
            if (retryCount < MAX_RETRIES - 1) {
                // Auto-retry with a small delay
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                }, 1000);
            } else {
                // Final fallback
                setCurrentImage(generatePlaceholderImage(placeName));
                setImageStatus('error');
                onImageError?.();
            }
        }
    }, [retryCount, onImageError]);

    useEffect(() => {
        setRetryCount(0);
        setImageStatus('loading');
        
        // Load image when component mounts or place changes
        loadImage(place.imageUrl, place.placeName, place.placeType);
    }, [place.imageUrl, place.placeName, place.placeType, loadImage]);

    const handleImageRetry = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (retryCount < MAX_RETRIES) {
            setRetryCount(0);
            setImageStatus('loading');
            await loadImage(place.imageUrl, place.placeName, place.placeType);
        }
    };

    const handleImageClick = (e) => {
        // Prevent retry when clicking on error state, open maps instead
        if (imageStatus === 'error') {
            e.preventDefault();
        }
    };

    const getMapsUrl = () => {
        const query = place.location || place.placeName || '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    };

    // Format metadata for display
    const formatMetadata = () => {
        const metadata = place.metadata || {};
        const items = [];

        if (metadata.ticketPricing && metadata.ticketPricing !== 'Free entry') {
            items.push({
                key: 'price',
                label: '💰',
                text: metadata.ticketPricing,
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-800'
            });
        }

        if (metadata.rating && metadata.rating !== 'Not rated') {
            items.push({
                key: 'rating',
                label: '⭐',
                text: metadata.rating,
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800'
            });
        }

        if (metadata.travelTime) {
            items.push({
                key: 'travel',
                label: '🚗',
                text: `Travel: ${metadata.travelTime}`,
                bgColor: 'bg-purple-100',
                textColor: 'text-purple-800'
            });
        }

        if (metadata.duration) {
            items.push({
                key: 'duration',
                label: '⏱️',
                text: `Visit: ${metadata.duration}`,
                bgColor: 'bg-green-100',
                textColor: 'text-green-800'
            });
        }

        if (metadata.bestTimeToVisit) {
            items.push({
                key: 'bestTime',
                label: '⏰',
                text: `Best: ${metadata.bestTimeToVisit}`,
                bgColor: 'bg-orange-100',
                textColor: 'text-orange-800'
            });
        }

        return items;
    };

    const metadataItems = formatMetadata();

    return (
        <div className={`flex flex-col sm:flex-row gap-5 p-4 ${!isLast ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}>
            {/* Image Section */}
            <div className="flex-shrink-0 w-full sm:w-36 h-48 sm:h-36 overflow-hidden relative rounded-3xl">
                <Link
                    to={getMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                    aria-label={`View ${place.placeName} on Google Maps`}
                    onClick={handleImageClick}
                >
                    {imageStatus === 'loading' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-3xl flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="text-xs text-gray-500 mt-2">Loading image...</p>
                            </div>
                        </div>
                    )}

                    <img
                        src={currentImage}
                        alt={place.placeName}
                        className={`w-full h-full object-cover transition-all duration-300 ${
                            imageStatus === 'loaded' ? 'hover:scale-105 opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageStatus('loaded')}
                        onError={() => {
                            if (imageStatus !== 'error') {
                                setImageStatus('error');
                                onImageError?.();
                            }
                        }}
                        loading="lazy"
                    />

                    {imageStatus === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200/90 rounded-3xl p-3">
                            <span className="text-gray-500 text-sm text-center mb-2">
                                📷 Image not available
                            </span>
                            {retryCount < MAX_RETRIES ? (
                                <button
                                    onClick={handleImageRetry}
                                    className="px-3 py-1 text-xs bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition shadow-sm"
                                >
                                    Try Again
                                </button>
                            ) : (
                                <span className="text-xs text-gray-400">Click for location</span>
                            )}
                        </div>
                    )}
                </Link>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0"> {/* Added min-w-0 for better text wrapping */}
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h4 className="font-bold text-red-800 text-lg leading-tight break-words">
                        {place.placeName || 'Unnamed Activity'}
                    </h4>
                    {place.metadata?.timeSlot && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                            🕒 {place.metadata.timeSlot}
                        </span>
                    )}
                </div>

                {place.placeDetails && (
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-2">
                        {place.placeDetails}
                    </p>
                )}

                {/* Metadata Tags */}
                {metadataItems.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {metadataItems.map((item) => (
                            <span
                                key={item.key}
                                className={`inline-flex items-center text-xs ${item.bgColor} ${item.textColor} px-2.5 py-1 rounded-full`}
                            >
                                <span className="mr-1" aria-label={item.key}>{item.label}</span>
                                <span>{item.text}</span>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

PlaceCardItem.propTypes = {
    place: PropTypes.shape({
        placeName: PropTypes.string.isRequired,
        placeDetails: PropTypes.string,
        imageUrl: PropTypes.string,
        location: PropTypes.string,
        placeType: PropTypes.string,
        metadata: PropTypes.shape({
            timeSlot: PropTypes.string,
            ticketPricing: PropTypes.string,
            rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            duration: PropTypes.string,
            timeTravel: PropTypes.string,
            bestTimeToVisit: PropTypes.string,
            travelTime: PropTypes.string
        })
    }).isRequired,
    isLast: PropTypes.bool,
    onImageError: PropTypes.func
};

PlaceCardItem.defaultProps = {
    isLast: false,
    onImageError: () => {}
};

export default PlaceCardItem;
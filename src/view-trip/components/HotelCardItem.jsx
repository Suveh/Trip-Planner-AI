// File: Trip_Planner/src/view-trip/components/HotelCardItem.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { getHotelImage, getRandomImage } from '../../lib/imageFallbacks';

const generateFallbackSVG = (hotelName) => {
    const uniqueSeed = hotelName?.split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;

    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='hsl(${uniqueSeed % 360}, 50%25, 90%25)'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='hsl(${uniqueSeed % 360}, 70%25, 30%25)' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(hotelName || 'Hotel')}%3C/text%3E%3C/svg%3E`;
};

export const HotelCardItem = ({ hotel }) => {
    const [currentImage, setCurrentImage] = useState('');
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!hotel) return;

        const controller = new AbortController();
        const { signal } = controller;

        const loadImage = async () => {
            if (signal.aborted) return;

            try {
                // ✅ Try different image sources in order of preference
                const imageSources = [
                    hotel.hotelImageUrl, // Direct image URL if available
                    await getHotelImage(hotel.hotelName, hotel.hotelAddress), // ✅ Async API call
                    await getRandomImage(hotel.hotelName, 'hotel'), // ✅ Async fallback
                    generateFallbackSVG(hotel.hotelName)
                ].filter(Boolean);

                for (const source of imageSources) {
                    if (signal.aborted) return;
                    
                    try {
                        const loaded = await new Promise((resolve) => {
                            const img = new Image();
                            img.src = source;
                            img.onload = () => resolve(source);
                            img.onerror = () => resolve(null);
                            
                            // Timeout for image loading
                            setTimeout(() => resolve(null), 3000);
                        });

                        if (loaded && !signal.aborted) {
                            setCurrentImage(loaded);
                            setImageLoading(false);
                            setImageError(false);
                            return;
                        }
                    } catch {
                        continue;
                    }
                }

                // If all sources fail
                if (!signal.aborted) {
                    setCurrentImage(generateFallbackSVG(hotel.hotelName));
                    setImageLoading(false);
                    setImageError(true);
                }
            } catch (error) {
                console.error('Error loading hotel image:', error);
                if (!signal.aborted) {
                    setCurrentImage(generateFallbackSVG(hotel.hotelName));
                    setImageLoading(false);
                    setImageError(true);
                }
            }
        };

        loadImage();

        return () => controller.abort();
    }, [hotel]);

    if (!hotel) return null;

    return (
        <div className="group hover:scale-[1.02] transition-transform duration-200 mt-5 border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md">
            <Link 
                to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.hotelName} ${hotel.hotelAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                aria-label={`View ${hotel.hotelName} on Google Maps`}
            >
                <div className="h-48 w-full overflow-hidden relative bg-gray-100">
                    {imageLoading && (
                        <div 
                            className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse flex items-center justify-center"
                            aria-hidden="true"
                        >
                            <span className="text-gray-500 text-sm">Loading hotel image...</span>
                        </div>
                    )}
                    <img
                        src={currentImage}
                        alt={imageError ? `${hotel.hotelName} placeholder` : `Image of ${hotel.hotelName}`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        loading="lazy"
                        onError={() => {
                            if (!imageError) {
                                setCurrentImage(generateFallbackSVG(hotel.hotelName));
                                setImageLoading(false);
                                setImageError(true);
                            }
                        }}
                    />
                </div>
            </Link>
            <div className="p-4">
                <h2 className="font-medium text-lg text-red-700">
                    <span role="img" aria-label="Hotel">🛎</span> {hotel.hotelName}
                </h2>
                {hotel.rating && (
                    <div className="flex items-center mt-1">
                        <span role="img" aria-label="Rating" className="text-yellow-500">⭐</span>
                        <span className="ml-1 text-sm">({hotel.rating})</span>
                    </div>
                )}
                <p className="text-sm mt-1">
                    <span role="img" aria-label="Price">💵</span> {hotel.price || "Price not available"}
                </p>
                {hotel.hotelAddress && (
                    <p className="text-xs text-gray-600 mt-1">
                        <span role="img" aria-label="Location">📍</span> 
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.hotelName} ${hotel.hotelAddress}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 hover:underline transition-colors"
                            aria-label={`View ${hotel.hotelName} location on Google Maps`}
                        >
                            {hotel.hotelAddress}
                        </a>
                    </p>
                )}
                <p className="font-medium mt-2">
                    <span role="img" aria-label="Description">👉</span> {hotel.description || "No description available."}
                </p>
            </div>
        </div>
    );
};

HotelCardItem.propTypes = {
    hotel: PropTypes.shape({
        hotelName: PropTypes.string,
        hotelImageUrl: PropTypes.string,
        hotelAddress: PropTypes.string,
        rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price: PropTypes.string,
        description: PropTypes.string
    })
};

export default HotelCardItem;
// src/lib/imageFallbacks.js

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_APP_UNSPLASH_ACCESS_KEY;

// Generic Unsplash API call
const searchUnsplash = async (query, orientation = 'landscape') => {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Unsplash API failed');
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
    
    return null;
  } catch (error) {
    console.error('Unsplash API error:', error);
    return null;
  }
};

// Fallback images
const getFallbackImage = (type = 'general') => {
  const fallbacks = {
    hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&w=600&h=400&fit=crop',
    place: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&w=600&h=400&fit=crop',
    destination: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&w=600&h=400&fit=crop',
    general: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&w=600&h=400&fit=crop'
  };
  
  return fallbacks[type] || fallbacks.general;
};

// Hotel images with proper API
export const getHotelImage = async (hotelName = '', hotelAddress = '') => {
  const addressParts = hotelAddress.split(',').map(part => part.trim());
  const locationContext = addressParts.slice(-2).join(' ');
  
  const searchQueries = [
    `${hotelName} hotel ${locationContext}`,
    `${hotelName} hotel`,
    `luxury hotel ${locationContext}`,
    `hotel ${locationContext}`,
    'luxury hotel lobby'
  ];
  
  for (const query of searchQueries) {
    if (query && query.trim()) {
      const result = await searchUnsplash(query);
      if (result) return result;
    }
  }
  
  return getFallbackImage('hotel');
};

// Place/attraction images
export const getPlaceImage = async (placeName = '', placeType = '') => {
  const placeTypeMap = {
    palace: 'palace architecture',
    museum: 'museum building',
    bridge: 'bridge landmark',
    garden: 'garden park',
    church: 'church architecture',
    tower: 'tower landmark',
    market: 'market street',
    square: 'city square plaza',
    park: 'park landscape',
    beach: 'beach ocean',
    mountain: 'mountain landscape',
    temple: 'temple architecture',
    default: 'landmark tourism'
  };

  const typeKeyword = placeTypeMap[placeType?.toLowerCase()] || placeTypeMap.default;
  
  const searchQueries = [
    `${placeName} ${typeKeyword}`,
    placeName,
    `${placeName} landmark`,
    typeKeyword
  ];
  
  for (const query of searchQueries) {
    if (query && query.trim()) {
      const result = await searchUnsplash(query);
      if (result) return result;
    }
  }
  
  return getFallbackImage('place');
};

// Destination/location images
export const getDestinationImage = async (locationName = '') => {
  const searchQueries = [
    `${locationName} city skyline`,
    `${locationName} landscape`,
    `${locationName} tourism`,
    locationName,
    'city skyline urban'
  ];
  
  for (const query of searchQueries) {
    if (query && query.trim()) {
      const result = await searchUnsplash(query);
      if (result) return result;
    }
  }
  
  return getFallbackImage('destination');
};

// Random images based on type
export const getRandomImage = async (seed = '', type = 'general') => {
  const typeCategories = {
    hotel: ['hotel luxury', 'resort', 'hotel room'],
    place: ['landmark famous', 'tourist attraction', 'architecture'],
    destination: ['city urban', 'travel destination', 'landscape'],
    general: ['travel', 'vacation', 'tourism']
  };

  const categories = typeCategories[type] || typeCategories.general;
  const query = seed ? `${seed} ${categories[0]}` : categories[0];
  
  const result = await searchUnsplash(query);
  return result || getFallbackImage(type);
};
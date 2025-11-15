//GlobalApi.jsx
// src/service/GlobalApi.js
export const GetPlaceDetails = (textQuery) => {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.places) {
      reject(new Error("Google Maps API not loaded"));
      return;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      query: textQuery,
      fields: ['name', 'photos']
    };

    service.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]) {
        resolve(results[0]);
      } else {
        reject(new Error(`Place not found (status: ${status})`));
      }
    });
  });
};

export const GetPlacePhoto = (photo, maxWidth = 400) => {
  if (!photo) return null;
  return photo.getUrl({ maxWidth });
};
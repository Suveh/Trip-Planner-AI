//AIModal.jsx
import {GoogleGenerativeAI} from "@google/generative-ai";
  
  
  const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro-preview-03-25",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 65536,
    responseModalities: [
    ],
    responseMimeType: "application/json",
  };
  
  
    export const chatSession = model.startChat({
      generationConfig,
      history: [{
        role:"user",
        parts:[
            {
                text:
                "Generate travel plan for location:Las vegas,for 3 days for couple with a cheap budget, Give me a Hotels options list with HotelName, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with placeName, Place details, Place Image url, Geo coordinates, ticket pricing, rating, Time travel each of the location for 3 days with each day plan with best time to visit in JSON format. "
            },
        ],
      },
      {
        role:"model",
        parts:[
            {
                text:
                "```json\n{\n \"hotels\": [\n {\n \"hotelName\": \"The D Las Vegas\",\n \"hotelAddress\": \"301 Fremont Street, Las Vegas, NV 89101\",\n\"price\": \"$50-$100 per night\",\n \"hotelImageUrl\": \"https://www.theDcasino.com/ images/hero/main-hero-02.jpg\",\n \"geoCoordinates\": \"36.1695, -115.1438\",\n \"rating\": \"3.5 stars\",\n \"description\": \"A budget-friendly hotel located in downtown Las Vegas with a retro vibe. It features a casino, pool, and several dining options."









            }
        ]
      }
      ],
    });
  
    
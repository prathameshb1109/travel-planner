// src/services/hotelService.js
import axios from "axios";
import { getAccessToken } from "./amadeusService";

const API_BASE_URL = "https://test.api.amadeus.com";

// Step 1: Get IATA city code from city/locality name
const getCityCodeByName = async (locationName, accessToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v1/reference-data/locations`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        keyword: locationName,
        subType: "CITY,AIRPORT",
        page: {
          limit: 5,
        },
      },
    });

    const location = response.data?.data?.[0];
    return location?.iataCode || null;
  } catch (error) {
    console.error("❌ Error fetching city code:", error.response?.data || error.message);
    return null;
  }
};

// Step 2: Get hotel IDs by city code
const getHotelIdsByCity = async (cityCode, accessToken) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/v1/reference-data/locations/hotels/by-city`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          cityCode,
        },
      }
    );

    const hotels = response.data?.data || [];
    const hotelIds = hotels.map((hotel) => hotel.hotelId);
    return hotelIds;
  } catch (error) {
    console.error("❌ Error fetching hotel IDs:", error.response?.data || error.message);
    return [];
  }
};

// Step 3: Get hotel offers by hotelIds
export const searchHotels = async (cityOrLocalityName) => {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  try {
    const cityCode = await getCityCodeByName(cityOrLocalityName, accessToken);
    if (!cityCode) {
      console.warn("⚠️ Could not resolve city code for:", cityOrLocalityName);
      return [];
    }

    const hotelIds = await getHotelIdsByCity(cityCode, accessToken);
    if (hotelIds.length === 0) return [];

    const validOffers = [];

    for (let i = 0; i < hotelIds.length; i += 5) {
      const batch = hotelIds.slice(i, i + 5).join(",");
      try {
        const response = await axios.get(`${API_BASE_URL}/v3/shopping/hotel-offers`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            hotelIds: batch,
          },
        });

        const offers = response.data?.data || [];
        validOffers.push(...offers);
      } catch (batchError) {
        console.warn(`⚠️ Skipping invalid batch: ${batch}`);
      }
    }

    console.log("✅ Hotel Offers fetched:", validOffers);
    return validOffers;
  } catch (error) {
    console.error("❌ Error fetching hotel offers:", error.response?.data || error.message);
    return [];
  }
};

// Step 4: Get hotel offer details (booking view)
export const getHotelOfferDetails = async (offerId) => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const response = await axios.get(
      `${API_BASE_URL}/v3/shopping/hotel-offers/${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching offer details:", error.response?.data || error.message);
    return null;
  }
};

import axios from "axios";

const API_BASE_URL = "https://test.api.amadeus.com";
const CLIENT_ID = process.env.REACT_APP_AMADEUS_API_KEY;
const CLIENT_SECRET = process.env.REACT_APP_AMADEUS_API_SECRET;

// 🔐 Fetch Access Token
async function getAccessToken() {
  try {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error("❌ API keys are missing. Check your .env file.");
      return null;
    }

    const response = await axios.post(
      `${API_BASE_URL}/v1/security/oauth2/token`,
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("✅ Access Token:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Error getting token:", error.response?.data || error.message);
    return null;
  }
}

// ✈️ Fetch Airline Name by Code
async function getAirlineNameFromAPI(code, accessToken) {
  try {
    if (!code) return "Unknown Airline";

    const res = await axios.get(`${API_BASE_URL}/v1/reference-data/airlines`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { airlineCodes: code },
    });

    return res.data?.data?.[0]?.businessName || code;
  } catch (error) {
    console.error("⚠️ Error fetching airline name:", error.response?.data || error.message);
    return code;
  }
}

// 🔍 Search Flights
async function searchFlights(origin, destination, date) {
  const accessToken = await getAccessToken();
  if (!accessToken) return [];

  try {
    const response = await axios.get(`${API_BASE_URL}/v2/shopping/flight-offers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: date,
        adults: 1,
        currencyCode: "INR",
      },
    });

    const offers = response.data?.data || [];
    if (offers.length === 0) {
      console.warn("⚠️ No flight offers found.");
      return [];
    }

    const flightsData = offers.map(offer => {
      const segment = offer.itineraries[0].segments[0];
      return {
        carrierCode: segment.carrierCode,
        flightNumber: segment.number,
        departureTime: segment.departure.at,
        arrivalTime: segment.arrival.at,
        price: offer.price.total,
        fullOffer: offer,
      };
    });

    const airlineNames = await Promise.all(
      flightsData.map(flight => getAirlineNameFromAPI(flight.carrierCode, accessToken))
    );

    const extractedFlights = flightsData.map((flight, index) => ({
      ...flight,
      flightName: `${airlineNames[index]} ${flight.flightNumber}`,
    }));

    console.log("✅ Flights fetched:", extractedFlights);
    return extractedFlights;
  } catch (error) {
    console.error("❌ Error fetching flights:", error.response?.data || error.message);
    return [];
  }
}

// 📦 Book a Flight
async function bookFlight(bookingData) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error("❌ No access token received, booking cannot proceed.");
    return null;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/v1/booking/flight-orders`,
      {
        data: {
          type: "flight-order",
          flightOffers: [bookingData.flight],
          travelers: [
            {
              id: "1",
              dateOfBirth: "1990-01-01",
              name: {
                firstName: bookingData.traveler.firstName.trim(),
                lastName: bookingData.traveler.lastName.trim(),
              },
              contact: {
                email: bookingData.traveler.email,
                phones: [
                  {
                    deviceType: "MOBILE",
                    countryCallingCode: "91",
                    number: bookingData.traveler.phone,
                  },
                ],
              },
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Booking Successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error booking flight:", JSON.stringify(error.response?.data || error.message, null, 2));
    return null;
  }
}

// ✅ Export all required functions
export {
  getAccessToken,
  searchFlights,
  bookFlight,
};

const axios = require('axios');
require('dotenv').config(); // .env फाइल से API Keys लोड करने के लिए

// Amadeus API Keys (.env से)
const CLIENT_ID = process.env.AMADEUS_API_KEY;
const CLIENT_SECRET = process.env.AMADEUS_API_SECRET;

// ✅ Access Token प्राप्त करने का Function
async function getAccessToken() {
    try {
        const response = await axios.post(
            'https://test.api.amadeus.com/v1/security/oauth2/token',
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );

        console.log("✅ Access Token:", response.data.access_token);
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error getting token:", error.response.data);
        return null;
    }
}

// ✅ Flight Search करने का Function
async function searchFlights() {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        console.error("🚨 Token fetch failed!");
        return;
    }

    // 🔹 आज की तारीख से 5 दिन आगे की यात्रा की तारीख सेट करें
    const today = new Date();
    today.setDate(today.getDate() + 5); // 5 दिन बाद की तारीख लें
    const departureDate = today.toISOString().split('T')[0]; // YYYY-MM-DD Format

    try {
        const response = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
            headers: { 
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                originLocationCode: 'DEL',   // Origin (Delhi)
                destinationLocationCode: 'DXB',  // Destination (Dubai)
                departureDate: departureDate,  // यात्रा की तारीख (फिक्स्ड नहीं, आज से 5 दिन बाद)
                adults: 1,  // यात्री संख्या
                currencyCode: 'INR'  // करेंसी (Indian Rupees)
            }
        });

        console.log("✈️ Flight Results:", response.data);
    } catch (error) {
        console.error("❌ Error fetching flights:", error.response.data);
    }
}

// 🔹 Function को कॉल करें (Flights सर्च करने के लिए)
searchFlights();

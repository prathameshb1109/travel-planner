const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

// ✅ Allow frontend requests from React (port 3002)
app.use(cors({ origin: "http://localhost:3000" }));

// ✅ Middleware to parse JSON requests
app.use(express.json());

// 🔹 POST Route to book a flight
app.post("/book-flight", async (req, res) => {
  try {
    const { bookingData } = req.body; // Frontend se data

    // ✅ Amadeus API Call
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/booking/flight-orders",
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${process.env.AMADEUS_ACCESS_TOKEN}`, // 🔹 Token environment variable me rakho
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Booking Success:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Booking Failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Booking Failed", details: error.message });
  }
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { searchHotels } from "../services/hotelService";

const HotelSearch = () => {
  const [cityCode, setCityCode] = useState("DEL");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState({});
  const [formData, setFormData] = useState({});
  const [bookingStatus, setBookingStatus] = useState({});
  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(null);

  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [selectedHours, setSelectedHours] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    const data = await searchHotels(cityCode);

    // Apply filters
    let filteredHotels = data;

    // Filter by hours
    if (selectedHours) {
      filteredHotels = filteredHotels.map((hotel) => ({
        ...hotel,
        offers: hotel.offers?.filter(() => true) || [], // keep all offers, but we will use hours on display
      }));
    }

    // Apply sorting
    if (sortOrder === "lowToHigh") {
      filteredHotels.sort((a, b) => {
        const aPrice = parseFloat(a.offers?.[0]?.price?.total || 0);
        const bPrice = parseFloat(b.offers?.[0]?.price?.total || 0);
        return aPrice - bPrice;
      });
    } else if (sortOrder === "highToLow") {
      filteredHotels.sort((a, b) => {
        const aPrice = parseFloat(a.offers?.[0]?.price?.total || 0);
        const bPrice = parseFloat(b.offers?.[0]?.price?.total || 0);
        return bPrice - aPrice;
      });
    } else if (sortOrder === "popular") {
      filteredHotels.sort((a, b) => (b.hotel?.rating || 0) - (a.hotel?.rating || 0));
    }

    setHotels(filteredHotels);
    setLoading(false);
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("https://api.unsplash.com/search/photos", {
          params: { query: "hotel room", per_page: 5 },
          headers: {
            Authorization: `Client-ID ${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`,
          },
        });
        setImages(response.data.results);
      } catch (err) {
        setImageError(err);
      } finally {
        setImageLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleInputChange = (formKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [formKey]: {
        ...prev[formKey],
        [field]: value,
      },
    }));
  };

  const handleBookNow = async (hotelIndex, offerIndex) => {
    const hotelData = hotels[hotelIndex];
    const selectedOffer = hotelData.offers[offerIndex];
    const formKey = `${hotelIndex}-${offerIndex}`;
    const currentData = formData[formKey] || {};

    const { name, email, guests, hours } = currentData;

    if (!name || !email || !guests || !hours) {
      alert("Please fill in all booking details.");
      return;
    }

    try {
      const res = await sendBookingMail({
        name,
        email,
        guests,
        hours,
        hotelName: hotelData.name,
        hotelAddress: hotelData.address?.lines?.join(", ") || "N/A",
        totalPrice: getHourlyPrice(selectedOffer.price?.total, hours),
      });

      setBookingStatus((prev) => ({
        ...prev,
        [formKey]: res.message || "Booking email sent successfully!",
      }));
    } catch (error) {
      console.error("Email send failed:", error);
      setBookingStatus((prev) => ({
        ...prev,
        [formKey]: "Failed to send booking email.",
      }));
    }
  };


  const getHourlyPrice = (basePrice, hours) => {
    const multipliers = { "3": 0.25, "6": 0.5, "12": 0.75, "24": 1 };
    const multiplier = multipliers[hours] || 1;
    return (parseFloat(basePrice) * multiplier).toFixed(2);
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  const sendBookingMail = async (payload) => {
    const response = await fetch("http://localhost:5000/booking.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  };


  return (
    <section className="section-hotels section-padding">
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Search Hotels</h2>

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={cityCode}
          onChange={(e) => setCityCode(e.target.value.toUpperCase())}
          placeholder="City Code (e.g., DEL)"
          className="border px-4 py-2 rounded w-48"
        />

        <input
          type="date"
          value={checkInDate}
          onChange={(e) => setCheckInDate(e.target.value)}
          className="border px-4 py-2 rounded w-44"
        />

        <input
          type="time"
          value={checkInTime}
          onChange={(e) => setCheckInTime(e.target.value)}
          className="border px-4 py-2 rounded w-36"
        />

        <input
          type="time"
          value={checkOutTime}
          onChange={(e) => setCheckOutTime(e.target.value)}
          className="border px-4 py-2 rounded w-36"
        />

        <select
          value={selectedHours}
          onChange={(e) => setSelectedHours(e.target.value)}
          className="border px-4 py-2 rounded w-36"
        >
          <option value="">Hours</option>
          <option value="3">3 Hours</option>
          <option value="6">6 Hours</option>
          <option value="12">12 Hours</option>
          <option value="24">24 Hours</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-4 py-2 rounded w-40"
        >
          <option value="">Sort By</option>
          <option value="lowToHigh">Low to High</option>
          <option value="highToLow">High to Low</option>
          <option value="popular">Most Popular</option>
        </select>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading hotels...</p>}

      <div className="space-y-8">
        {hotels.map((hotelData, index) => {
          const hotel = hotelData.hotel || {};
          const address = hotel.address || {};
          const lines = address.lines || [];
          const offers = hotelData.offers || [];
          const currentData = formData[index] || {};

          const getFallbackCity = (hotel) => {
            const match = hotel.name?.match(/(Delhi|New Delhi|Gurgaon|Noida|Mumbai|Sohna)/i);
            return match ? match[0] : hotel.cityCode || "Location not available";
          };

          const cityName = address.cityName || getFallbackCity(hotel);

          return (
            <div key={index} className="border p-4 rounded shadow bg-white">
              <div className="w-full max-w-3xl mx-auto">
                {imageLoading ? (
                  <p>Loading images...</p>
                ) : imageError ? (
                  <p className="text-red-600">Error loading images: {imageError.message}</p>
                ) : (
                  <Slider {...sliderSettings}>
                    {images.map((image) => (
                      <div key={image.id}>
                        <img
                          src={image.urls.regular}
                          alt={image.alt_description || "Hotel Room"}
                          className="w-full h-64 object-cover rounded"
                        />
                      </div>
                    ))}
                  </Slider>
                )}
              </div>

              <h3 className="text-xl font-semibold mt-4">{hotel.name}</h3>
              <p>
                {lines.length > 0 ? lines.join(", ") : ""}
                {lines.length > 0 && cityName ? ", " : ""}
                {cityName || <span className="italic text-gray-500">Location not available</span>}
              </p>
              <p>Rating: {hotel.rating || "N/A"}</p>

              {offers.map((offer, offerIndex) => (
                <div key={offerIndex} className="bg-gray-100 p-4 mt-4 rounded">
                  <p><strong>Room:</strong> {offer.room?.description?.text || "N/A"}</p>
                  <p><strong>Type:</strong> {offer.room?.typeEstimated?.category || "N/A"}</p>
                  <p><strong>Beds:</strong> {offer.room?.typeEstimated?.beds || "N/A"}</p>
                  <p>
                    <strong>Price:</strong> ₹{getHourlyPrice(offer.price?.total, currentData.hours || selectedHours)}{" "}
                    {offer.price?.currency}
                  </p>
                  <p><strong>Check-In:</strong> {offer.checkInDate}</p>
                  <p><strong>Check-Out:</strong> {offer.checkOutDate}</p>

                  <button
                    onClick={() =>
                      setShowForm((prev) => ({
                        ...prev,
                        [`${index}-${offerIndex}`]: !prev[`${index}-${offerIndex}`],
                      }))
                    }
                    className="text-blue-600 underline mt-2"
                  >
                    {showForm[`${index}-${offerIndex}`] ? "Hide" : "View"} Booking Details
                  </button>

                  {showForm[`${index}-${offerIndex}`] && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="block mb-1 font-medium">Hours</label>
                        <select
                          className="w-full border p-2 rounded"
                          value={formData[`${index}-${offerIndex}`]?.hours || ""}
                          onChange={(e) =>
                            handleInputChange(`${index}-${offerIndex}`, "hours", e.target.value)
                          }
                        >
                          <option value="">Select Hours</option>
                          <option value="3">3 Hours</option>
                          <option value="6">6 Hours</option>
                          <option value="12">12 Hours</option>
                          <option value="24">24 Hours</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                          type="text"
                          className="w-full border p-2 rounded"
                          value={formData[`${index}-${offerIndex}`]?.name || ""}
                          onChange={(e) =>
                            handleInputChange(`${index}-${offerIndex}`, "name", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Your Email</label>
                        <input
                          type="email"
                          className="w-full border p-2 rounded"
                          value={formData[`${index}-${offerIndex}`]?.email || ""}
                          onChange={(e) =>
                            handleInputChange(`${index}-${offerIndex}`, "email", e.target.value)
                          }
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">Number of Guests</label>
                        <input
                          type="number"
                          className="w-full border p-2 rounded"
                          value={formData[`${index}-${offerIndex}`]?.guests || ""}
                          onChange={(e) =>
                            handleInputChange(`${index}-${offerIndex}`, "guests", e.target.value)
                          }
                        />
                      </div>

                      <button
                        onClick={() => handleBookNow(index, offerIndex)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Book Now
                      </button>

                      {bookingStatus[`${index}-${offerIndex}`] && (
                        <p className="mt-2 font-semibold text-green-700">
                          {bookingStatus[`${index}-${offerIndex}`]}
                        </p>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
    </section>
  );
};

export default HotelSearch;

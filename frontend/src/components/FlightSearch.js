import React, { useState } from "react";
import { searchFlights, bookFlight } from "../services/amadeusService";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FlightSearch = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("DEL");
  const [destination, setDestination] = useState("DXB");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [traveler, setTraveler] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleSearch = async () => {
    setLoading(true);
    setTimeout(async () => {
      const data = await searchFlights(origin, destination, date);
      console.log("📌 API Response:", data); // Debugging step

      if (data && Array.isArray(data)) {
        setFlights(data); // Ensure it's an array
      } else if (data && data.data && Array.isArray(data.data)) {
        setFlights(data.data); // If API response has `data` key
      } else {
        setFlights([]); // Fallback
      }

      setLoading(false);
      setStep(2);
    }, 1500);
  };

  const handleBookNow = (flight) => {
    setLoading(true);
    setTimeout(() => {
      setSelectedFlight(flight);
      setLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleBooking = async () => {
    if (!selectedFlight) return alert("Please select a flight.");
    setLoading(true);
    setTimeout(async () => {
      const response = await bookFlight({ flight: selectedFlight, traveler });
      if (response?.errors) {
        alert(`❌ Booking Error: ${response.errors[0]?.detail || "Booking failed."}`);
        setLoading(false);
        return;
      }
      setBookingSuccess(true);
      setLoading(false);
      setStep(4);
    }, 1500);
  };

  const generateBoardingPass = async () => {
    if (!selectedFlight || !traveler.firstName || !traveler.lastName) {
      alert("Missing booking details!");
      return;
    }

    const doc = new jsPDF("landscape", "pt", [750, 300]);

    doc.setFont("helvetica", "bold");

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 10, 210, 280, 40, 40, 'F');

    doc.setFillColor(255, 233, 183);
    doc.roundedRect(220, 10, 315, 280, 0, 0, 'F');

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(535, 10, 205, 280, 0, 40, 'F');

    // Left Section
    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("seat", 30, 40);
    doc.setFontSize(28);
    doc.setTextColor(97, 97, 97);
    doc.text("25A", 30, 70);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("departure time", 30, 120);
    doc.setFontSize(24);
    doc.setTextColor(97, 97, 97);
    doc.text("5:19AM", 30, 150);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("departing", 30, 190);
    doc.setFontSize(16);
    doc.setTextColor(97, 97, 97);
    doc.text(origin, 30, 210);

    // Middle Section
    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("passenger", 240, 40);
    doc.setFontSize(14);
    doc.setTextColor(97, 97, 97);
    doc.text(`${traveler.lastName}, ${traveler.firstName}`, 240, 60);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("gate", 240, 100);
    doc.setFontSize(20);
    doc.setTextColor(97, 97, 97);
    doc.text("L22", 240, 130);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("flight", 320, 100);
    doc.setFontSize(20);
    doc.setTextColor(97, 97, 97);
    doc.text("402RD", 320, 130);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("destination", 240, 170);
    doc.setFontSize(16);
    doc.setTextColor(97, 97, 97);
    doc.text(destination, 240, 190);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("group", 240, 230);
    doc.setFontSize(16);
    doc.setTextColor(97, 97, 97);
    doc.text("3", 240, 250);

    doc.setFontSize(10);
    doc.setTextColor(97, 97, 97);
    doc.text("Z8 4653 402 16WAJ 4798P", 240, 275);

    // Right Section
    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("flight", 550, 40);
    doc.setFontSize(14);
    doc.setTextColor(97, 97, 97);
    doc.text("402RD", 550, 60);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("seat", 550, 90);
    doc.setFontSize(14);
    doc.setTextColor(97, 97, 97);
    doc.text("25A", 550, 110);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("depart", 550, 140);
    doc.setFontSize(14);
    doc.setTextColor(97, 97, 97);
    doc.text("5:19AM", 550, 160);

    doc.setFontSize(10);
    doc.setTextColor(163, 164, 164);
    doc.text("passenger", 550, 190);
    doc.setFontSize(12);
    doc.setTextColor(97, 97, 97);
    doc.text(`${traveler.lastName}, ${traveler.firstName}`, 550, 210);

    // Barcode
    const barcodeCanvas = document.createElement("canvas");
    JsBarcode(barcodeCanvas, "402RD-25A", {
      format: "CODE128",
      width: 2,
      height: 80,
      displayValue: false,
      background: "transparent",
    });

    const rotatedCanvas = document.createElement("canvas");
    rotatedCanvas.width = 80;
    rotatedCanvas.height = 200;

    const ctx = rotatedCanvas.getContext("2d");
    ctx.translate(rotatedCanvas.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(barcodeCanvas, 0, 0);

    const rotatedBarcodeDataURL = rotatedCanvas.toDataURL("image/png");

    doc.addImage(rotatedBarcodeDataURL, "PNG", 690, 50, 50, 160);

    doc.save("BoardingPass.pdf");
  };

  return (
    <section className="section-flight section-padding">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center text-white">Domestic and International Flights</h1>
            {loading && <Skeleton count={8} height={30} />}

            {!loading && step === 1 && (
              <div className="form-container">
                <div className="form-group">
                <label>From</label>
                <input value={origin} onChange={(e) => setOrigin(e.target.value)} />
                </div>
                <div className="icon-wrapper">
                  <svg width="20" height="15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.11 6.739a.842.842 0 0 1-.842-.842V4.844a.21.21 0 0 0-.21-.211H4.543a1.264 1.264 0 1 1 0-2.527h8.515a.21.21 0 0 0 .21-.21V.841A.843.843 0 0 1 14.544.12l4.212 2.528a.842.842 0 0 1 0 1.444L14.544 6.62a.843.843 0 0 1-.433.12ZM.409 10.26l4.212-2.527a.842.842 0 0 1 1.276.723v1.053c0 .116.095.21.21.21h8.516a1.264 1.264 0 1 1 0 2.528H6.108a.21.21 0 0 0-.21.21v1.053a.842.842 0 0 1-1.277.722L.409 11.705a.842.842 0 0 1 0-1.445Z" fill="#2276E3"></path></svg>
                  </div>
                <div className="form-group">
                <label>To</label>
                <input value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
                <div className="form-group">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <button onClick={handleSearch}>Search Flights</button>
              </div>
            )}
            {!loading && step === 2 && flights && (
              <div className="section-flight-result">
                <h3 className="text-white text-center mt-5">Flight Results</h3>
                {flights.length > 0 ? (
                  flights.map((flight, idx) => (
                    <li key={idx} className="flights-result">
                      <div className="flight-details">
                      <h5 className="flight-name">✈️ {flight.flightName || "Unknown Flight"} - ₹{flight.price || "N/A"}</h5>
                      <p className="flight-departure">🕗 Departure: {flight.departureTime ? new Date(flight.departureTime).toLocaleString() : "N/A"}</p>
                      <p className="flight-arrival">🕘 Arrival: {flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleString() : "N/A"} </p>
                      </div>
                      <button onClick={() => handleBookNow(flight)}>Book Now</button>
                    </li>
                  ))
                ) : (
                  <p>❌ No flights found.</p>
                )}

              </div>
            )}


            {!loading && step === 3 && selectedFlight && (
              <div>
                <h3 className="text-white text-center mt-5">Enter Traveler Info</h3>
                <form className="section-form">
                <input placeholder="First Name" value={traveler.firstName} onChange={(e) => setTraveler({ ...traveler, firstName: e.target.value })} />
                <input placeholder="Last Name" value={traveler.lastName} onChange={(e) => setTraveler({ ...traveler, lastName: e.target.value })} />
                <input placeholder="Email" value={traveler.email} onChange={(e) => setTraveler({ ...traveler, email: e.target.value })} />
                <input placeholder="Phone" value={traveler.phone} onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })} />
                <button onClick={handleBooking}>Confirm Booking</button>
                </form>
              </div>
            )}

            {!loading && step === 4 && bookingSuccess && (
              <div className="section-confirmation">
                <h3 className="text-white text-center mt-5">Booking Confirmed!</h3>
                <button onClick={generateBoardingPass}>Download Boarding Pass</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightSearch;

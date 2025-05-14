import React, { useState, useRef } from "react";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const API_KEY = "9b82a54382fcb4f604451638ece48db3";

const MovieSearch = () => {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [ticketConfirmed, setTicketConfirmed] = useState(false);
    const ticketRef = useRef();

    const searchMovie = async () => {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=mr-IN`
        );
        const data = await response.json();
        setMovies(data.results || []);
        setSelectedMovie(null);
        setSelectedSeats([]);
        setTicketConfirmed(false);
    };

    const toggleSeat = (seat) => {
        setSelectedSeats((prev) =>
            prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
        );
    };

    const handleBooking = () => {
        setTicketConfirmed(true);

        setTimeout(() => {
            JsBarcode("#barcode", selectedMovie.id.toString(), {
                format: "CODE128",
                lineColor: "#000",
                width: 2,
                height: 40,
                displayValue: true,
            });

            // Wait for everything (poster + barcode) to render before PDF
            setTimeout(() => {
                generatePDF();
            }, 1000);
        }, 300);
    };

    const generatePDF = async () => {
        const canvas = await html2canvas(ticketRef.current, {
            useCORS: true,
            allowTaint: false,
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
        pdf.save("Movie_Ticket.pdf");
    };

    const renderSeats = () => {
        const rows = 5;
        const cols = 8;
        let seats = [];

        for (let row = 0; row < rows; row++) {
            let rowSeats = [];
            for (let col = 0; col < cols; col++) {
                const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`;
                rowSeats.push(
                    <div
                        key={seatNumber}
                        onClick={() => toggleSeat(seatNumber)}
                        style={{
                            width: "30px",
                            height: "30px",
                            margin: "5px",
                            backgroundColor: selectedSeats.includes(seatNumber) ? "green" : "lightgray",
                            display: "inline-block",
                            textAlign: "center",
                            lineHeight: "30px",
                            cursor: "pointer",
                            borderRadius: "4px",
                        }}
                    >
                        {seatNumber}
                    </div>
                );
            }
            seats.push(<div key={row}>{rowSeats}</div>);
        }

        return seats;
    };

    return (
        <div style={{ padding: "30px", fontFamily: "Arial" }}>
            <h1>Movie Ticket Booking</h1>

            <div style={{ marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Enter movie name..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ padding: "8px", width: "300px" }}
                />
                <button onClick={searchMovie} style={{ marginLeft: "10px", padding: "8px 12px" }}>
                    Search
                </button>
            </div>

            {movies.length > 0 && !selectedMovie && (
                <div>
                    <h3>Results:</h3>
                    {movies.map((movie) => (
                        <div
                            key={movie.id}
                            onClick={() => setSelectedMovie(movie)}
                            style={{ marginBottom: "15px", cursor: "pointer" }}
                        >
                            <strong>{movie.title}</strong> ({movie.release_date?.split("-")[0]})
                        </div>
                    ))}
                </div>
            )}

            {selectedMovie && !ticketConfirmed && (
                <div>
                    <h2>{selectedMovie.title}</h2>
                    <p>{selectedMovie.overview}</p>
                    {selectedMovie.poster_path && (
                        <img
                            src={`https://image.tmdb.org/t/p/w300${selectedMovie.poster_path}`}
                            alt={selectedMovie.title}
                            crossOrigin="anonymous"
                            style={{ borderRadius: "8px", marginBottom: "10px" }}
                        />
                    )}
                    <h3>Select Seats:</h3>
                    <div style={{ marginBottom: "10px" }}>{renderSeats()}</div>
                    <button
                        onClick={handleBooking}
                        style={{ marginTop: "20px", padding: "10px 15px" }}
                        disabled={selectedSeats.length === 0}
                    >
                        Book Tickets
                    </button>
                </div>
            )}

            {ticketConfirmed && selectedMovie && (
                <div
                    ref={ticketRef}
                    style={{
                        marginTop: "30px",
                        padding: "20px",
                        border: "2px dashed green",
                        borderRadius: "10px",
                        background: "#f0fff0",
                        width: "fit-content",
                    }}
                >
                    <h2>Movie Ticket</h2>
                    <p>
                        Movie: <strong>{selectedMovie.title}</strong>
                    </p>
                    <p>Seats: <strong>{selectedSeats.join(", ")}</strong></p>

                    {selectedMovie.poster_path && (
                        <img
                            src={`https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}`}
                            alt="Poster"
                            crossOrigin="anonymous"
                            style={{ marginBottom: "10px", borderRadius: "4px" }}
                        />
                    )}

                    <svg id="barcode" />
                </div>
            )}
        </div>
    );
};

export default MovieSearch;

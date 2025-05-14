import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Flights from './components/FlightSearch';
import Hotels from './components/HotelSearch';
import './App.css';
import MovieSearch from './components/MovieSearch';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<Flights />} />
        <Route path='/hotels' element={<Hotels />} />
        <Route path='/movies' element={<MovieSearch />} />
      </Routes>
    </Router>
  );
}

export default App;

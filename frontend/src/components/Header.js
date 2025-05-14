import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../images/logo.png';
import Airoplane from '../images/airplane.png';
import Hotels from '../images/hotel.png';
import Movies from '../images/movies.png'

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className='header'>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-12'>
            <div className='header-wrapper'>
              <div className='header-logo-wrapper'>
                <div className='logo-wrapper'>
                  <Link to='/'>
                    <img src={Logo} alt='Travel Planner' className='main-logo' />
                  </Link>
                </div>
              </div>
              <div className='header-navbar-wrapper'>
                <div className="navbar-wrapper">
                  <ul className='navbar'>
                    <li className='nav-item-wrapper'>
                      <Link to='/' className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                        <span className='icon'><img src={Airoplane} alt='flight' className='nav-icon' /></span>Flights
                      </Link>
                    </li>
                    <li className='nav-item-wrapper'>
                      <Link to='/hotels' className={`nav-item ${isActive('/hotels') ? 'active' : ''}`}>
                        <span className='icon'><img src={Hotels} alt='hotel' className='nav-icon' /></span>Hotels
                      </Link>
                    </li>
                    <li className='nav-item-wrapper'>
                      <Link to='/movies' className={`nav-item ${isActive('/movies') ? 'active' : ''}`}>
                        <span className='icon'><img src={Movies} alt='train' className='nav-icon' /></span>Movies
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header;

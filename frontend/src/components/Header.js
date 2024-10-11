import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from './logo192.png';

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Destination Health Logo" className="logo" />
        <Link to="/" className="title-link">
          <span className="title">Destination Health</span>
        </Link>
      </div>

      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="#how-to-book">How to book</Link>
        <Link to="#about-us">About us</Link>
        <Link to="/signin" className="sign-in-btn">Sign in</Link>
      </nav>
    </header>
  );
}

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <div className="title">Destination Health</div>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="#how-to-book">How to book</Link>
        <Link to="#about-us">About us</Link>
        <Link to="#staff-portal">Staff Portal</Link>
        <Link to="/signin" className="sign-in-btn">Sign in</Link>
      </nav>
    </header>
  );
}

export default Header;
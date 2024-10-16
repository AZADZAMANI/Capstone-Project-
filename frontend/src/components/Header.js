// /frontend/src/components/Header.js

import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import { AuthContext } from '../AuthContext'; // Import AuthContext

function Header() {
  const { auth, logout } = useContext(AuthContext); // Access auth state and logout function
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <header className="header">
      <Link to="/" className="title-link">
        <div className="title">Destination Health</div>
      </Link>
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="#how-to-book">How to book</Link>
        <Link to="#about-us">About us</Link>
        {auth.token ? (
          <div className="dropdown" ref={dropdownRef}>
            <button className="profile-btn" onClick={toggleDropdown}>
              Profile &#9662;
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <Link to="/myprofile">View Profile</Link>
                <button onClick={handleLogout} className="logout-btn">Log Out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin" className="sign-in-btn">Sign in</Link>
        )}
      </nav>
    </header>
  );
}

export default Header;

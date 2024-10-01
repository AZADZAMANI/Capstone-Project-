import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import '../common.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
          <header className="header">
        <div className="title">Destination Health</div>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#how-to-book">How to book</a>
          <a href="#about-us">About us</a>
          <a href="#staff-portal">Staff Portal</a>
          <button className="sign-in-btn" onClick={() => navigate('/signin')}>Sign in</button>
        </nav>
      </header>

      {/* Slogan */}
      <section className="slogan">
        <h1>Healthcare made easy.</h1>
      </section>
      <section className="cards">
        <div className="card">
          <h2>New patient</h2>
          <button onClick={() => navigate('/register')}>Register</button>
        </div>
        <div className="card">
          <h2>Family Doctor</h2>
          <button>Book Now</button>
        </div>
        <div className="card">
          <h2>Walk in</h2>
          <button>Book Now</button>
        </div>
      </section>
    </div>
  );
}

export default HomePage;

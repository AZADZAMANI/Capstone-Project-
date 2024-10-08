import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import '../common.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">


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
      </section>
    </div>
  );
}

export default HomePage;

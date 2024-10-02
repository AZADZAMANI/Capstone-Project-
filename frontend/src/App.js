import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; 
import RegisterPage from './pages/RegisterPage'; 
import './common.css';
import Header from './components/Header';

function App() {
  return (
    <Router basename="/Capstone-Project-">
      <div className="App">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/myprofile" element={<div>My Profile Page</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;

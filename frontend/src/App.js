import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; 
import RegisterPage from './pages/RegisterPage'; 
import './common.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/myprofile" element={<div>My Profile Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

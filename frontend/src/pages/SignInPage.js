import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignInPage.css';
import '../common.css';

function SignInPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, simulate successful sign-in without connecting to a backend
    if (formData.email && formData.password) {
      navigate('/myprofile');
    } else {
      alert('Please enter both email and password.');
    }
  };

  return (
    <div className="sign-in-page">
      <div className="form-container">
        <h1>Sign In</h1>
        <form className="sign-in-form" onSubmit={handleSubmit}>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </label>
          <button type="submit">Sign In</button>
        </form>
        <p className="register-link">
        Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default SignInPage;
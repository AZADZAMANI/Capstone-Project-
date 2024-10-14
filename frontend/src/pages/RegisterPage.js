import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for HTTP requests
import './RegisterPage.css';
import '../common.css';

function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    email: '',
    password: '',
    termsAccepted: false,
    selectedDoctor: '',
  });

  const [doctorList, setDoctorList] = useState([
    { id: 1, name: 'Dr. John Smith', maxPatients: 10, currentPatients: 5 },
    { id: 2, name: 'Dr. Sarah Johnson', maxPatients: 8, currentPatients: 8 },
    { id: 3, name: 'Dr. Emily Brown', maxPatients: 12, currentPatients: 3 },
  ]);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      termsAccepted: e.target.checked,
    });
  };

  const handleDoctorSelection = (e) => {
    setFormData({
      ...formData,
      selectedDoctor: e.target.value,
    });
  };

  const isFormValid =
    formData.fullName &&
    formData.address &&
    formData.phoneNumber &&
    formData.email &&
    formData.password &&
    formData.termsAccepted;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid) {
      // Prepare the data to send
      const data = {
        full_name: formData.fullName,
        address: formData.address,
        phone_number: formData.phoneNumber,
        email: formData.email,
        password_hash: formData.password,  // Assuming plain text password (consider hashing on backend)
        doctor: formData.selectedDoctor,
      };

      // Send data to the backend
      axios.post('http://localhost:8000/health_app/api/register/', data)
        .then((response) => {
          console.log("Patient registered:", response.data);
          alert("Registration successful!");
          navigate('/myprofile'); // Navigate to the profile page after successful registration
        })
        .catch((error) => {
          console.error("There was an error registering the patient:", error);
          alert("Registration failed. Please try again.");
        });
    }
  };

  return (
    <div className="register-page">
      <div className="form-container">
        <h1>New Patient Registration Form</h1>
        <h2>Welcome to Destination Health</h2>
        <form className="registration-form" onSubmit={handleSubmit}>
          <label>
            Full Name:
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Address:
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Phone Number:
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Select Doctor:
            <div className="custom-select">
              <select
                name="selectedDoctor"
                value={formData.selectedDoctor}
                onChange={handleDoctorSelection}
                required
              >
                <option value="">-- Please Select a Doctor --</option>
                {doctorList.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} (Current Patients: {doctor.currentPatients}/{doctor.maxPatients})
                  </option>
                ))}
              </select>
            </div>
          </label>
          <label className="terms-checkbox">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={handleCheckboxChange}
            />
            I accept the terms
          </label>
          <button type="submit" disabled={!isFormValid}>
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
export default RegisterPage;


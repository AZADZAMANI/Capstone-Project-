import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import PatientProfile from './pages/PatientProfile';
import SignInPage from './pages/SignInPage'; 
import './common.css';
import Header from './components/Header';
import BookAppointmentPage from './pages/BookAppointmentPage'; 

function App() {
  const [patientData, setPatientData] = useState({
    patient: { name: "John Doe" },
    upcomingAppointments: [
      { doctor: "Dr. Smith", date: "2023-05-15", startTime: "10:00 AM", endTime: "11:00 AM" },
      { doctor: "Dr. Johnson", date: "2023-05-20", startTime: "2:00 PM", endTime: "3:00 PM" },
    ],
    appointmentHistory: [
      { doctor: "Dr. Brown", date: "2023-04-10", time: "9:00 AM" },
      { doctor: "Dr. Davis", date: "2023-03-22", time: "11:30 AM" },
    ],
  });

  return (
    <Router basename="/Capstone-Project-">
      <div className="App">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signin" element={<SignInPage />} /> 
            <Route path="/book-appointment" element={<BookAppointmentPage />} />
            <Route path="/myprofile" element={
              patientData ? (
                <PatientProfile
                  patient={patientData.patient}
                  upcomingAppointments={patientData.upcomingAppointments}
                  appointmentHistory={patientData.appointmentHistory}
                />
              ) : (
                <div>Loading...</div>
              )
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

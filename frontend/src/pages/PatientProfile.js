import React from 'react';
import './PatientProfile.css';

function PatientProfile({ patient, upcomingAppointments, appointmentHistory }) {
  if (!patient) {
    return <div>Loading patient data...</div>;
  }

  return (
    <div className="patient-profile">
      <h1>Welcome back, {patient.name}</h1>
      <h2>Welcome to Destination Health. How can we help you today?</h2>

      <section className="appointments-section">
        <h3>Upcoming Appointments</h3>
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment, index) => (
                <tr key={index}>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.date}</td>
                  <td>{`${appointment.startTime} - ${appointment.endTime}`}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No upcoming appointments</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="history-section">
        <h3>Appointment History</h3>
        <table className="history-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {appointmentHistory.length > 0 ? (
              appointmentHistory.map((appointment, index) => (
                <tr key={index}>
                  <td>{appointment.doctor}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No appointment history</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default PatientProfile;

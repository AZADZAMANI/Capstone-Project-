import React from 'react';
import AppointmentCard from './AppointmentCard';
import HistoryCard from './HistoryCard';
import './PatientProfile.css';

function PatientProfile({ patient, upcomingAppointments, appointmentHistory }) {
  if (!patient) {
    return <div>Loading patient data...</div>;
  }

  return (
    <div className="patient-profile">
      <h1>Welcome back, {patient.name}</h1>
      <h2>Welcome to Destination Health, How can we help you today?</h2>
      
      <AppointmentCard appointments={upcomingAppointments || []} />
      <HistoryCard history={appointmentHistory || []} />
    </div>
  );
}

export default PatientProfile;
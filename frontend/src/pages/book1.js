// /Users/star/Capstone/Capstone-Project-/frontend/src/pages/BookAppointmentPage.js

import React, { useState, useEffect, useContext } from 'react';
import './BookAppointmentPage.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Import AuthContext

function BookAppointmentPage() {
  const { auth } = useContext(AuthContext); // Access auth state
  const [availableTimes, setAvailableTimes] = useState([]);
  const [selectedTimeID, setSelectedTimeID] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  // Fetch available time slots on component mount
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/available_times', {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch available time slots');
        }

        const data = await response.json();
        setAvailableTimes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching available times:', error);
        setMessage({ type: 'error', text: 'Failed to load available time slots. Please try again later.' });
        setLoading(false);
      }
    };

    fetchAvailableTimes();
  }, [auth.token]);

  const handleSelectChange = (e) => {
    setSelectedTimeID(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTimeID) {
      setMessage({ type: 'error', text: 'Please select a time slot to book.' });
      return;
    }

    setBooking(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5001/api/book_appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ availableTimeID: parseInt(selectedTimeID, 10) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setMessage({ type: 'success', text: 'Appointment booked successfully!' });

      // Optionally, you can wait for a moment before redirecting
      setTimeout(() => {
        navigate('/myprofile');
      }, 2000);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to book appointment. Please try again.' });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="book-appointment-page">
      <div className="booking-container">
        <h1>Book an Appointment</h1>

        {message.text && (
          <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p>Loading available time slots...</p>
        ) : availableTimes.length > 0 ? (
          <form className="booking-form" onSubmit={handleSubmit}>
            <label htmlFor="timeSlot">Select an Available Time Slot:</label>
            <select id="timeSlot" value={selectedTimeID} onChange={handleSelectChange} required>
              <option value="">-- Select a Time Slot --</option>
              {availableTimes.map((slot) => (
                <option key={slot.AvailableTimeID} value={slot.AvailableTimeID}>
                  {`${slot.ScheduleDate} | ${slot.StartTime} - ${slot.EndTime}`}
                </option>
              ))}
            </select>

            <button type="submit" disabled={booking}>
              {booking ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        ) : (
          <p>No available time slots at the moment. Please check back later.</p>
        )}
      </div>
    </div>
  );
}

export default BookAppointmentPage;

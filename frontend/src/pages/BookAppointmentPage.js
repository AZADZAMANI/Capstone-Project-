import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookAppointmentPage.css';

function BookAppointmentPage() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [weekData, setWeekData] = useState([]);
  const navigate = useNavigate();

  const doctorName = 'Dr. John Smith'; // Mock doctor's name

  useEffect(() => {
    // Generate mock data for the upcoming week (7 days, 8 hours each day)
    const generatedWeekData = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const formattedDate = date.toISOString().split('T')[0]; // yyyy-MM-dd format

      return {
        day,
        date: formattedDate,
        hours: Array.from({ length: 8 }, (_, hourIndex) => {
          const time = `${9 + hourIndex}:00 AM`;
          return {
            time,
            available: Math.random() > 0.3, // Random availability for mock data
          };
        }),
      };
    });
    setWeekData(generatedWeekData);
  }, []);

  const handleDaySelection = (index) => {
    setSelectedDayIndex(index);
    setSelectedSlot(null); // Clear the selected slot when selecting a new day
  };

  const handleSlotSelection = (time) => {
    if (selectedDayIndex !== null) {
      setSelectedSlot({ day: weekData[selectedDayIndex].day, time });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSlot) {
      console.log('Selected Slot:', selectedSlot);
      // Navigate to profile page
      navigate('/myprofile');
    } else {
      alert('Please select a time slot.');
    }
  };

  return (
    <div className="book-appointment-page">
      <h1>Book an Appointment with {doctorName}</h1>
      <div className="day-selection-container">
        {weekData.map((dayData, dayIndex) => (
          <div
            key={dayIndex}
            className={`day-card ${selectedDayIndex === dayIndex ? 'selected-day' : ''}`}
            onClick={() => handleDaySelection(dayIndex)}
          >
            <p>{dayData.day}</p>
            <p>{dayData.date}</p>
          </div>
        ))}
      </div>
      <div className="hours-selection-container">
        {Array.from({ length: 8 }, (_, hourIndex) => {
          if (selectedDayIndex !== null) {
            const hourData = weekData[selectedDayIndex].hours[hourIndex];
            return (
              <button
                key={hourIndex}
                type="button"
                className={`hour-card ${hourData.available ? 'available' : 'taken'} ${selectedSlot?.time === hourData.time ? 'selected-slot' : ''}`}
                onClick={() => hourData.available && handleSlotSelection(hourData.time)}
                disabled={!hourData.available}
              >
                {hourData.time}
              </button>
            );
          } else {
            return (
              <button
                key={hourIndex}
                type="button"
                className="hour-card disabled"
                disabled
              >
                {`${9 + hourIndex}:00 AM`}
              </button>
            );
          }
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default BookAppointmentPage;

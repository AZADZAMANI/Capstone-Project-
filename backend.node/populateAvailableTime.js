// populateAvailableTime.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = (`0${ (date.getMonth() + 1)}`).slice(-2);
  const day = (`0${ date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

// Helper function to format time as HH:MM in 24-hour format
function formatTime(hour) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

// Connect to the SQLite database
const dbPath = path.resolve(__dirname, 'clinic.db'); // Adjust the path if necessary
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
    process.exit(1);
  } else {
    console.log('Connected to the SQLite database.');
    initialize();
  }
});

// Function to initialize the population process
function initialize() {
  // Step 1: Retrieve all DoctorIDs
  const getDoctorsQuery = `SELECT DoctorID FROM doctors`;

  db.all(getDoctorsQuery, [], (err, rows) => {
    if (err) {
      console.error('Error fetching doctors:', err.message);
      db.close();
      process.exit(1);
    }

    if (rows.length === 0) {
      console.log('No doctors found in the database. Please add doctors first.');
      db.close();
      process.exit(0);
    }

    const doctorIDs = rows.map(row => row.DoctorID);
    console.log(`Found ${doctorIDs.length} doctor(s).`);

    // Step 2: Generate time slots for the next 10 days
    const today = new Date();
    const numberOfDays = 10;
    const dailyStartHour = 9;  // 9:00 AM
    const dailyEndHour = 16;   // 4:00 PM

    const insertStmt = db.prepare(`
      INSERT INTO available_time (DoctorID, ScheduleDate, StartTime, EndTime, IsAvailable)
      VALUES (?, ?, ?, ?, ?)
    `);

    let totalInserts = 0;

    for (let dayOffset = 0; dayOffset < numberOfDays; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const formattedDate = formatDate(currentDate);

      for (let hour = dailyStartHour; hour < dailyEndHour; hour++) {
        const startTime = formatTime(hour);
        const endTime = formatTime(hour + 1);

        doctorIDs.forEach((doctorID) => {
          // Randomly determine availability: 1 (available) or 0 (not available)
          const isAvailable = Math.random() < 0.7 ? 1 : 0; // 70% chance available

          insertStmt.run(
            [doctorID, formattedDate, startTime, endTime, isAvailable],
            (err) => {
              if (err) {
                console.error('Error inserting available time:', err.message);
              } else {
                totalInserts++;
              }
            }
          );
        });
      }
    }

    insertStmt.finalize((err) => {
      if (err) {
        console.error('Error finalizing statement:', err.message);
      } else {
        console.log(`Inserted ${totalInserts} available time slots into the database.`);
      }
      db.close();
    });
  });
}

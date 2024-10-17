// server.js

// Import required packages
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize the express app
const app = express();
const port = process.env.PORT || 5001;

// CORS Configuration: Allow only specific origin during development
const corsOptions = {
  origin: 'http://localhost:3000', // Update this to your frontend's URL
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions)); // Enable CORS with specified options
app.use(bodyParser.json()); // Parse incoming JSON data

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'clinic.db'); 
const db = new sqlite3.Database(process.env.DB_PATH || dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Create doctors table first as patients table depends on it
    db.run(
      `CREATE TABLE IF NOT EXISTS doctors (
        DoctorID INTEGER PRIMARY KEY AUTOINCREMENT,
        FullName TEXT NOT NULL,
        MaxPatientNumber INTEGER NOT NULL,
        CurrentPatientNumber INTEGER NOT NULL DEFAULT 0
      )`,
      (err) => {
        if (err) {
          console.error('Error creating doctors table:', err.message);
        } else {
          console.log('Doctors table ready.');

          // Insert initial doctors if table is empty
          db.get('SELECT COUNT(*) as count FROM doctors', (err, row) => {
            if (err) {
              console.error('Error counting doctors:', err.message);
            } else if (row.count === 0) {
              const doctors = [
                { FullName: 'Dr. John Smith', MaxPatientNumber: 100, CurrentPatientNumber: 0 },
                { FullName: 'Dr. Emily Davis', MaxPatientNumber: 80, CurrentPatientNumber: 0 },
                { FullName: 'Dr. Michael Brown', MaxPatientNumber: 120, CurrentPatientNumber: 0 },
                // Add more doctors as needed
              ];

              const stmt = db.prepare(
                `INSERT INTO doctors (FullName, MaxPatientNumber, CurrentPatientNumber) VALUES (?, ?, ?)`
              );
              doctors.forEach((doc) => {
                stmt.run([doc.FullName, doc.MaxPatientNumber, doc.CurrentPatientNumber]);
              });
              stmt.finalize();
              console.log('Initial doctors inserted.');
            }
          });
        }
      }
    );

    // Create patients table
    db.run(
      `CREATE TABLE IF NOT EXISTS patients (
        PatientID INTEGER PRIMARY KEY AUTOINCREMENT,
        FullName TEXT NOT NULL,
        BirthDate TEXT NOT NULL,
        PhoneNumber TEXT NOT NULL,
        Email TEXT NOT NULL UNIQUE,
        Gender TEXT NOT NULL,
        PasswordHash TEXT NOT NULL,
        DoctorID INTEGER,
        FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
            ON UPDATE CASCADE
            ON DELETE SET NULL
      )`,
      (err) => {
        if (err) {
          console.error('Error creating patients table:', err.message);
        } else {
          console.log('Patients table ready.');
        }
      }
    );

    // Create available_time table
    db.run(
      `CREATE TABLE IF NOT EXISTS available_time (
        AvailableTimeID INTEGER PRIMARY KEY AUTOINCREMENT,
        DoctorID INTEGER NOT NULL,
        ScheduleDate TEXT NOT NULL, -- Format: 'YYYY-MM-DD'
        StartTime TEXT NOT NULL,    -- Format: 'HH:MM'
        EndTime TEXT NOT NULL,      -- Format: 'HH:MM'
        IsAvailable INTEGER NOT NULL DEFAULT 1, -- 1 = Available, 0 = Not Available
        FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
            ON UPDATE CASCADE
            ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error('Error creating available_time table:', err.message);
        } else {
          console.log('Available_time table ready.');
        }
      }
    );

    // Create appointments table
    db.run(
      `CREATE TABLE IF NOT EXISTS appointments (
        AppointmentID INTEGER PRIMARY KEY AUTOINCREMENT,
        PatientID INTEGER NOT NULL,
        DoctorID INTEGER NOT NULL,
        AvailableTimeID INTEGER NOT NULL,
        FOREIGN KEY (PatientID) REFERENCES patients(PatientID)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
        FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
            ON UPDATE CASCADE
            ON DELETE CASCADE,
        FOREIGN KEY (AvailableTimeID) REFERENCES available_time(AvailableTimeID)
            ON UPDATE CASCADE
            ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error('Error creating appointments table:', err.message);
        } else {
          console.log('Appointments table ready.');
        }
      }
    );
  }
});

// Serve static frontend files if needed (optional)
// app.use(express.static(path.join(__dirname, 'public')));

// JWT Middleware to Protect Routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(403).json({ message: 'Invalid access token' });
    }
    req.user = user; // { id: PatientID, email: Email }
    next();
  });
}

// API route to register a new patient
app.post('/api/register', (req, res) => {
  const { fullName, birthdate, gender, phoneNumber, email, password, selectedDoctor } = req.body;

  if (!fullName || !birthdate || !gender || !phoneNumber || !email || !password || !selectedDoctor) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if the selected doctor can accept new patients
  const doctorQuery = `SELECT * FROM doctors WHERE DoctorID = ?`;
  db.get(doctorQuery, [selectedDoctor], (err, doctor) => {
    if (err) {
      console.error('Error fetching doctor:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (doctor.CurrentPatientNumber >= doctor.MaxPatientNumber) {
      return res.status(400).json({ error: 'Selected doctor is at full capacity. Please choose another doctor.' });
    }

    // Hash the password before storing
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err.message);
        return res.status(500).json({ error: 'Error processing your request' });
      }

      // Insert the new patient
      const insertPatientQuery = `INSERT INTO patients (FullName, BirthDate, PhoneNumber, Email, Gender, PasswordHash, DoctorID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.run(
        insertPatientQuery,
        [fullName, birthdate, phoneNumber, email, gender, hash, selectedDoctor],
        function (err) {
          if (err) {
            console.error('Error inserting patient:', err.message);
            return res.status(500).json({ error: 'Error registering patient' });
          }

          // Update doctor's current patient count
          const updateDoctorQuery = `UPDATE doctors SET CurrentPatientNumber = CurrentPatientNumber + 1 WHERE DoctorID = ?`;
          db.run(updateDoctorQuery, [selectedDoctor], (err) => {
            if (err) {
              console.error('Error updating doctor patient count:', err.message);
              // Optionally, you might want to rollback the patient insertion here
            }

            res.json({ message: 'Patient registered successfully', patientId: this.lastID });
          });
        }
      );
    });
  });
});

// API route to get all doctors
app.get('/api/doctors', (req, res) => {
  db.all('SELECT * FROM doctors', [], (err, rows) => {
    if (err) {
      console.error('Error fetching doctors:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API route to get all patients (protected route)
app.get('/api/patients', authenticateToken, (req, res) => {
  db.all('SELECT * FROM patients', [], (err, rows) => {
    if (err) {
      console.error('Error fetching patients:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API route to get a specific patient by ID (protected route)
app.get('/api/patients/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM patients WHERE PatientID = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching patient:', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(row);
  });
});

// API route to get upcoming appointments for a patient (protected route)
app.get('/api/patients/:id/upcomingAppointments', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Ensure the requester is accessing their own data
  if (parseInt(id, 10) !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const query = `
    SELECT 
      a.AppointmentID, 
      d.FullName as doctor, 
      at.ScheduleDate as date, 
      at.StartTime as startTime, 
      at.EndTime as endTime
    FROM appointments a
    JOIN doctors d ON a.DoctorID = d.DoctorID
    JOIN available_time at ON a.AvailableTimeID = at.AvailableTimeID
    WHERE a.PatientID = ? AND at.ScheduleDate >= date('now')
    ORDER BY at.ScheduleDate ASC, at.StartTime ASC
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Error fetching upcoming appointments:', err.message);
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    res.json(rows);
  });
});

// API route to get appointment history for a patient (protected route)
app.get('/api/patients/:id/appointmentHistory', authenticateToken, (req, res) => {
  const { id } = req.params;

  // Ensure the requester is accessing their own data
  if (parseInt(id, 10) !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const query = `
    SELECT 
      a.AppointmentID, 
      d.FullName as doctor, 
      at.ScheduleDate as date, 
      at.StartTime as time
    FROM appointments a
    JOIN doctors d ON a.DoctorID = d.DoctorID
    JOIN available_time at ON a.AvailableTimeID = at.AvailableTimeID
    WHERE a.PatientID = ? AND at.ScheduleDate < date('now')
    ORDER BY at.ScheduleDate DESC, at.StartTime DESC
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Error fetching appointment history:', err.message);
      return res.status(500).json({ error: 'Failed to fetch appointment history' });
    }
    res.json(rows);
  });
});

// API route to fetch available time slots for the patient's doctor (protected route)
app.get('/api/available_times', authenticateToken, (req, res) => {
  const patientID = req.user.id;

  // Fetch the doctor's ID assigned to the patient
  const doctorQuery = `SELECT DoctorID FROM patients WHERE PatientID = ?`;
  db.get(doctorQuery, [patientID], (err, row) => {
    if (err) {
      console.error('Error fetching doctor for patient:', err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!row || !row.DoctorID) {
      return res.status(400).json({ error: 'No doctor assigned to the patient' });
    }

    const doctorID = row.DoctorID;

    // Fetch available time slots for the doctor
    const availableTimesQuery = `
      SELECT AvailableTimeID, DoctorID, ScheduleDate, StartTime, EndTime
      FROM available_time
      WHERE DoctorID = ? AND IsAvailable = 1 AND ScheduleDate >= date('now')
      ORDER BY ScheduleDate ASC, StartTime ASC
    `;

    db.all(availableTimesQuery, [doctorID], (err, times) => {
      if (err) {
        console.error('Error fetching available time slots:', err.message);
        return res.status(500).json({ error: 'Failed to fetch available time slots' });
      }

      res.json(times);
    });
  });
});


// API route to book an appointment (protected route)
app.post('/api/book_appointment', authenticateToken, (req, res) => {
  const patientID = req.user.id;
  const { availableTimeID } = req.body;

  if (!availableTimeID) {
    return res.status(400).json({ error: 'AvailableTimeID is required' });
  }

  // Start a transaction to ensure atomicity
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Check if the available time slot is still available
    const checkAvailabilityQuery = `
      SELECT * FROM available_time
      WHERE AvailableTimeID = ? AND IsAvailable = 1
    `;

    db.get(checkAvailabilityQuery, [availableTimeID], (err, timeSlot) => {
      if (err) {
        console.error('Error checking time slot availability:', err.message);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Failed to book appointment' });
      }

      if (!timeSlot) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Selected time slot is no longer available' });
      }

      const doctorID = timeSlot.DoctorID;
      const scheduleDate = timeSlot.ScheduleDate;
      const startTime = timeSlot.StartTime;
      const endTime = timeSlot.EndTime;

      // Insert the appointment
      const insertAppointmentQuery = `
        INSERT INTO appointments (PatientID, DoctorID, AvailableTimeID)
        VALUES (?, ?, ?)
      `;
      db.run(insertAppointmentQuery, [patientID, doctorID, availableTimeID], function (err) {
        if (err) {
          console.error('Error inserting appointment:', err.message);
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Failed to book appointment' });
        }

        const appointmentID = this.lastID;

        // Update the available_time slot to not available
        const updateTimeSlotQuery = `
          UPDATE available_time
          SET IsAvailable = 0
          WHERE AvailableTimeID = ?
        `;
        db.run(updateTimeSlotQuery, [availableTimeID], function (err) {
          if (err) {
            console.error('Error updating time slot availability:', err.message);
            db.run('ROLLBACK');
            return res.status(500).json({ error: 'Failed to book appointment' });
          }

          // Commit the transaction
          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err.message);
              return res.status(500).json({ error: 'Failed to book appointment' });
            }

            res.json({
              message: 'Appointment booked successfully',
              appointment: {
                AppointmentID: appointmentID,
                DoctorID: doctorID,
                ScheduleDate: scheduleDate,
                StartTime: startTime,
                EndTime: endTime,
              },
            });
          });
        });
      });
    });
  });
});

// Login endpoint
app.post('/api/signin', (req, res) => {
  const { email, password } = req.body;

  // Check if both fields are filled in
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter both email and password' });
  }

  // Find the user by email
  const query = `SELECT * FROM patients WHERE Email = ?`;
  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('Error retrieving user:', err.message);
      return res.status(500).json({ message: 'Error retrieving user' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the entered password with the stored hashed password
    bcrypt.compare(password, user.PasswordHash, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err.message);
        return res.status(500).json({ message: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Incorrect password' });
      }

      // If password matches, issue a JWT token
      const token = jwt.sign(
        { id: user.PatientID, email: user.Email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Sign-in successful',
        token,
        user: {
          id: user.PatientID,
          FullName: user.FullName,
          Email: user.Email,
        },
      });
    });
  });
});

// Logout endpoint (optional)
app.post('/api/logout', (req, res) => {
  // Since JWTs are stateless, logout can be handled on the client side by deleting the token.
  // Alternatively, implement token blacklisting on the server side for enhanced security.
  res.json({ message: 'Logout successful' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

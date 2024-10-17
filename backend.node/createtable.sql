-- Enable foreign key support in SQLite
PRAGMA foreign_keys = ON;

-- ---------------------------
-- 1. Create the doctors table
-- ---------------------------
CREATE TABLE IF NOT EXISTS doctors (
    DoctorID INTEGER PRIMARY KEY AUTOINCREMENT,
    FullName TEXT NOT NULL,
    MaxPatientNumber INTEGER NOT NULL,
    CurrentPatientNumber INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------
-- 2. Create the patients table
-- ---------------------------
CREATE TABLE IF NOT EXISTS patients (
    PatientID INTEGER PRIMARY KEY AUTOINCREMENT,
    FullName TEXT NOT NULL,
    BirthDate TEXT NOT NULL, -- Format: 'YYYY-MM-DD'
    PhoneNumber TEXT NOT NULL,
    Email TEXT NOT NULL UNIQUE,
    Gender TEXT NOT NULL,
    PasswordHash TEXT NOT NULL,
    DoctorID INTEGER,
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ---------------------------
-- 3. Create the available_time table
-- ---------------------------
CREATE TABLE IF NOT EXISTS available_time (
    AvailableTimeID INTEGER PRIMARY KEY AUTOINCREMENT,
    DoctorID INTEGER NOT NULL,
    ScheduleDate TEXT NOT NULL, -- Format: 'YYYY-MM-DD'
    StartTime TEXT NOT NULL,    -- Format: 'HH:MM AM/PM' or 'HH:MM:SS'
    EndTime TEXT NOT NULL,      -- Format: 'HH:MM AM/PM' or 'HH:MM:SS'
    IsAvailable INTEGER NOT NULL DEFAULT 1, -- 1 = Available, 0 = Not Available
    FOREIGN KEY (DoctorID) REFERENCES doctors(DoctorID)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ---------------------------
-- 4. Create the appointments table
-- ---------------------------
CREATE TABLE IF NOT EXISTS appointments (
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
);

-- ---------------------------
-- 5. Create Indexes for Performance
-- ---------------------------

-- Index on patients' Email for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(Email);

-- Index on appointments for patient-based queries
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(PatientID);

-- Index on appointments for doctor-based queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(DoctorID);

-- Index on available_time for doctor-based availability checks
CREATE INDEX IF NOT EXISTS idx_available_time_doctor_id ON available_time(DoctorID);

-- ---------------------------
-- 6. Insert Initial Data into doctors Table
-- ---------------------------

-- Insert a default doctor if the table is empty
INSERT INTO doctors (FullName, MaxPatientNumber, CurrentPatientNumber)
SELECT 'Dr. John Smith', 100, 0
WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE FullName = 'Dr. John Smith');

-- You can add more doctors as needed by replicating the INSERT statement:
-- INSERT INTO doctors (FullName, MaxPatientNumber, CurrentPatientNumber)
-- SELECT 'Dr. Jane Doe', 80, 0
-- WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE FullName = 'Dr. Jane Doe');

-- ---------------------------
-- 7. (Optional) Populate available_time Table
-- ---------------------------

-- Example: Populate available_time for Dr. John Smith for the next 7 days, 8 AM to 5 PM in 1-hour slots
-- This is optional and can be customized based on your scheduling needs

-- Uncomment and modify the following block as needed

/*
BEGIN TRANSACTION;
INSERT INTO available_time (DoctorID, ScheduleDate, StartTime, EndTime, IsAvailable)
VALUES 
    (1, '2024-05-01', '09:00 AM', '10:00 AM', 1),
    (1, '2024-05-01', '10:00 AM', '11:00 AM', 1),
    (1, '2024-05-01', '11:00 AM', '12:00 PM', 1),
    -- Add more time slots as needed
    ;
COMMIT;
*/

-- ---------------------------
-- 8. (Optional) Create Triggers to Maintain CurrentPatientNumber
-- ---------------------------

-- Automatically update CurrentPatientNumber when a new patient is assigned to a doctor
CREATE TRIGGER IF NOT EXISTS trg_after_patient_insert
AFTER INSERT ON patients
FOR EACH ROW
BEGIN
    UPDATE doctors
    SET CurrentPatientNumber = CurrentPatientNumber + 1
    WHERE DoctorID = NEW.DoctorID;
END;

-- Automatically update CurrentPatientNumber when a patient is deleted or their DoctorID is changed
CREATE TRIGGER IF NOT EXISTS trg_after_patient_delete
AFTER DELETE ON patients
FOR EACH ROW
BEGIN
    UPDATE doctors
    SET CurrentPatientNumber = CurrentPatientNumber - 1
    WHERE DoctorID = OLD.DoctorID;
END;

CREATE TRIGGER IF NOT EXISTS trg_after_patient_update
AFTER UPDATE ON patients
FOR EACH ROW
WHEN OLD.DoctorID != NEW.DoctorID
BEGIN
    -- Decrement the old doctor's count
    UPDATE doctors
    SET CurrentPatientNumber = CurrentPatientNumber - 1
    WHERE DoctorID = OLD.DoctorID;
    
    -- Increment the new doctor's count
    UPDATE doctors
    SET CurrentPatientNumber = CurrentPatientNumber + 1
    WHERE DoctorID = NEW.DoctorID;
END;

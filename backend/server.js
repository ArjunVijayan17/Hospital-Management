require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/pharmacy', require('./routes/pharmacy'));
app.use('/api/trials', require('./routes/trials'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/departments', require('./routes/departments'));

// Dashboard stats endpoint
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const PharmacyStock = require('./models/PharmacyStock');
const ClinicalTrial = require('./models/ClinicalTrial');
const Bill = require('./models/Bill');

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, totalDoctors, todayAppointments, lowStock, activeTrials, pendingBills] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      PharmacyStock.countDocuments({ $expr: { $lte: ['$quantityInStock', '$lowStockThreshold'] } }),
      ClinicalTrial.countDocuments({ status: { $in: ['active', 'recruiting'] } }),
      Bill.countDocuments({ status: { $in: ['pending', 'overdue'] } })
    ]);

    res.json({ totalPatients, totalDoctors, todayAppointments, lowStock, activeTrials, pendingBills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'CHIMS Backend is running!' });
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

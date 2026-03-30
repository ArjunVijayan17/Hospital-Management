const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String },
  medicines: [{
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    medicineName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  labTestsOrdered: [String],
  notes: { type: String },
  followUpDate: { type: Date },
  dispensingStatus: { type: String, enum: ['pending', 'dispensed', 'partial'], default: 'pending' }
}, { timestamps: true });

prescriptionSchema.pre('save', async function () {
  if (!this.prescriptionId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Prescription').countDocuments();
    this.prescriptionId = `CHR-RX-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);

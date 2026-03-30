const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  date: { type: Date, required: true },
  timeSlot: { type: String },
  type: { type: String, enum: ['in-person', 'teleconsultation'], default: 'in-person' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'no-show'], default: 'scheduled' },
  reason: { type: String },
  notes: { type: String },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }
}, { timestamps: true });

appointmentSchema.pre('save', async function () {
  if (!this.appointmentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `CHR-APT-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

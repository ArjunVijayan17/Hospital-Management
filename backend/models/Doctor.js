const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  name: { type: String, required: true },
  qualification: [String],
  specialisation: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  registrationNumber: { type: String },
  phone: { type: String },
  email: { type: String },
  photo: { type: String },
  consultationFee: { type: Number, default: 0 },
  schedule: [{
    day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    startTime: String,
    endTime: String,
    slotDurationMinutes: { type: Number, default: 30 },
    maxAppointments: { type: Number, default: 10 },
    isAvailable: { type: Boolean, default: true }
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

doctorSchema.pre('save', async function () {
  if (!this.employeeId) {
    const count = await mongoose.model('Doctor').countDocuments();
    this.employeeId = `CHR-DOC-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);

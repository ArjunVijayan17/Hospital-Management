const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  name: { type: String, required: true },
  dob: { type: Date },
  age: { type: Number },
  gender: { type: String },
  bloodGroup: { type: String },
  phone: { type: String },
  email: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  insurance: {
    provider: String,
    policyNumber: String,
    validUntil: Date
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

patientSchema.pre('save', async function () {
  if (!this.patientId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Patient').countDocuments();
    this.patientId = `CHR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Patient', patientSchema);

const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  genericName: { type: String, required: true },
  brandName: { type: String },
  category: { type: String },
  manufacturer: { type: String },
  unit: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);

const mongoose = require('mongoose');

const pharmacyStockSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  batchNumber: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
  quantityInStock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  purchasePrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  supplier: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PharmacyStock', pharmacyStockSchema);

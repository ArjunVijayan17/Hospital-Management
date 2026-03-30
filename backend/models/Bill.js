const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billId: { type: String, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  lineItems: [{
    type: { type: String, enum: ['consultation', 'medicine', 'lab', 'procedure', 'room', 'other'] },
    description: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }],
  subtotal: { type: Number, default: 0 },
  discount: { amount: Number, reason: String },
  insuranceCovered: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'pending', 'paid', 'partiallyPaid', 'overdue'], default: 'draft' },
  paymentRecords: [{
    amount: Number,
    mode: String,
    date: Date,
    referenceNumber: String
  }]
}, { timestamps: true });

billSchema.pre('save', async function () {
  if (!this.billId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Bill').countDocuments();
    this.billId = `CHR-BILL-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

module.exports = mongoose.model('Bill', billSchema);

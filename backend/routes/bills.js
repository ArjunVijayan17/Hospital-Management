const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const { authGuard } = require('../middleware/auth');

router.get('/', authGuard, async (req, res) => {
  try {
    const bills = await Bill.find().populate('patientId').sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/patient/:patientId', authGuard, async (req, res) => {
  try {
    const bills = await Bill.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authGuard, async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/payment', authGuard, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    bill.paymentRecords.push(req.body);
    bill.amountPaid += req.body.amount;
    bill.status = bill.amountPaid >= bill.totalAmount ? 'paid' : 'partiallyPaid';
    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

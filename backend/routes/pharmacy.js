const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const PharmacyStock = require('../models/PharmacyStock');
const { authGuard } = require('../middleware/auth');

// === Medicines (Master List) ===
router.get('/medicines', authGuard, async (req, res) => {
  try {
    const medicines = await Medicine.find({ isActive: true });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/medicines', authGuard, async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// === Stock Management ===
router.get('/stock', authGuard, async (req, res) => {
  try {
    const stock = await PharmacyStock.find().populate('medicineId').sort({ createdAt: -1 });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stock/available', authGuard, async (req, res) => {
  try {
    const stock = await PharmacyStock.find({ quantityInStock: { $gt: 0 } }).populate('medicineId');
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stock/low', authGuard, async (req, res) => {
  try {
    const stock = await PharmacyStock.find({
      $expr: { $lte: ['$quantityInStock', '$lowStockThreshold'] }
    }).populate('medicineId');
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/stock', authGuard, async (req, res) => {
  try {
    const stock = new PharmacyStock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/stock/:id', authGuard, async (req, res) => {
  try {
    const stock = await PharmacyStock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(stock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Dispense
router.post('/dispense', authGuard, async (req, res) => {
  try {
    const { stockId, quantity } = req.body;
    const stock = await PharmacyStock.findById(stockId);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });
    if (stock.quantityInStock < quantity) return res.status(400).json({ message: 'Insufficient stock' });
    stock.quantityInStock -= quantity;
    await stock.save();
    res.json({ message: 'Dispensed successfully', stock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

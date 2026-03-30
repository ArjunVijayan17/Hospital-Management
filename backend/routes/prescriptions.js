const express = require('express');
const router = express.Router();
const Prescription = require('../models/Prescription');
const { authGuard } = require('../middleware/auth');

router.get('/', authGuard, async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('patientId').populate('doctorId').sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authGuard, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId').populate('doctorId');
    if (!prescription) return res.status(404).json({ message: 'Not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/patient/:patientId', authGuard, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId').sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authGuard, async (req, res) => {
  try {
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { authGuard, roleGuard } = require('../middleware/auth');

// Get all patients
router.get('/', authGuard, async (req, res) => {
  try {
    const patients = await Patient.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single patient
router.get('/:id', authGuard, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create patient
router.post('/', authGuard, async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update patient
router.put('/:id', authGuard, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete (soft)
router.delete('/:id', authGuard, async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Patient deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authGuard } = require('../middleware/auth');

router.get('/', authGuard, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId').populate('doctorId').populate('departmentId')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/patient/:patientId', authGuard, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('doctorId').sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authGuard, async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id/status', authGuard, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

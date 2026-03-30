const express = require('express');
const router = express.Router();
const ClinicalTrial = require('../models/ClinicalTrial');
const { authGuard } = require('../middleware/auth');

router.get('/', authGuard, async (req, res) => {
  try {
    const trials = await ClinicalTrial.find()
      .populate('principalInvestigatorId').populate('departmentId').sort({ createdAt: -1 });
    res.json(trials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authGuard, async (req, res) => {
  try {
    const trial = await ClinicalTrial.findById(req.params.id)
      .populate('principalInvestigatorId').populate('departmentId');
    if (!trial) return res.status(404).json({ message: 'Trial not found' });
    res.json(trial);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authGuard, async (req, res) => {
  try {
    const trial = new ClinicalTrial(req.body);
    await trial.save();
    res.status(201).json(trial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authGuard, async (req, res) => {
  try {
    const trial = await ClinicalTrial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(trial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

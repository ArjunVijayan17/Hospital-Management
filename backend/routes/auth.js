const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Patient = require('../models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Signup Endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate request
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role validation: public signup is usually only for patients
    let assignedRole = role;
    if (role !== 'patient') {
      assignedRole = 'patient'; // Force patient role for public signup to be safe
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: assignedRole,
      isActive: true
    });

    // If role is patient, automatically create a Patient record
    let newPatient = null;
    if (assignedRole === 'patient') {
        newPatient = new Patient({
            name,
            email,
            userId: newUser._id
        });
        await newPatient.save();
        newUser.patientId = newPatient._id;
    }

    await newUser.save();

    // Create JWT
    const payload = {
      userId: newUser._id,
      patientId: newUser.patientId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ token, user: payload });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Validate request
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Role validation mismatch
    if (user.role === 'patient' && role !== 'patient') {
        return res.status(403).json({ message: 'Access denied: Please use the Patient portal login.' });
    }
    if (user.role !== 'patient' && role === 'patient') {
        return res.status(403).json({ message: 'Access denied: Please use the Admin portal login.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // If patient but missing patientId, try to find it or create it
    let finalPatientId = user.patientId;
    if (user.role === 'patient' && !finalPatientId) {
        let foundPatient = await Patient.findOne({ email: user.email }) || await Patient.findOne({ userId: user._id });
        
        if (!foundPatient) {
            // Auto-create missing patient record for legacy accounts
            foundPatient = new Patient({
                name: user.name,
                email: user.email,
                userId: user._id
            });
            await foundPatient.save();
        }
        
        finalPatientId = foundPatient._id;
        user.patientId = finalPatientId;
        await user.save();
    }

    // Create JWT
    const payload = {
      userId: user._id,
      patientId: finalPatientId,
      name: user.name,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token, user: payload });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

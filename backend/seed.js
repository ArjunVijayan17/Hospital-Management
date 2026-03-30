require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Department = require('./models/Department');
const Appointment = require('./models/Appointment');
const Medicine = require('./models/Medicine');
const PharmacyStock = require('./models/PharmacyStock');
const ClinicalTrial = require('./models/ClinicalTrial');
const Bill = require('./models/Bill');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}), Patient.deleteMany({}), Doctor.deleteMany({}),
      Department.deleteMany({}), Appointment.deleteMany({}), Medicine.deleteMany({}),
      PharmacyStock.deleteMany({}), ClinicalTrial.deleteMany({}), Bill.deleteMany({})
    ]);
    console.log('Cleared all collections');

    // === Users ===
    const adminHash = await bcrypt.hash('admin123', 12);
    const patientHash = await bcrypt.hash('patient123', 12);
    await User.create({ name: 'System Admin', email: 'admin@christhospital.in', passwordHash: adminHash, role: 'superAdmin' });
    const patientUser = await User.create({ name: 'John Doe', email: 'john@gmail.com', passwordHash: patientHash, role: 'patient' });
    console.log('Users seeded');

    // === Departments ===
    const deptNames = ['General Medicine','Cardiology','Neurology','Oncology','Orthopaedics','Gynaecology & Obstetrics','Paediatrics','Dermatology','Psychiatry','Radiology','Pathology & Laboratory','Emergency & Trauma'];
    const departments = [];
    for (const name of deptNames) {
      departments.push(await Department.create({ name, code: name.substring(0,3).toUpperCase() }));
    }
    console.log('Departments seeded');

    // === Doctors (use create() for pre-save hooks) ===
    const doctorData = [
      { name: 'Dr. Sarah Johnson', specialisation: 'Cardiologist', qualification: ['MBBS','MD Cardiology'], departmentId: departments[1]._id, consultationFee: 800, phone: '9876543210', email: 'sarah@christhospital.in' },
      { name: 'Dr. Rajesh Kumar', specialisation: 'Neurologist', qualification: ['MBBS','DM Neurology'], departmentId: departments[2]._id, consultationFee: 1000, phone: '9876543211', email: 'rajesh@christhospital.in' },
      { name: 'Dr. Priya Sharma', specialisation: 'General Physician', qualification: ['MBBS','MD'], departmentId: departments[0]._id, consultationFee: 500, phone: '9876543212', email: 'priya@christhospital.in' },
      { name: 'Dr. Ahmed Khan', specialisation: 'Orthopaedic Surgeon', qualification: ['MBBS','MS Ortho'], departmentId: departments[4]._id, consultationFee: 900, phone: '9876543213', email: 'ahmed@christhospital.in' },
      { name: 'Dr. Lakshmi Nair', specialisation: 'Dermatologist', qualification: ['MBBS','MD Dermatology'], departmentId: departments[7]._id, consultationFee: 700, phone: '9876543214', email: 'lakshmi@christhospital.in' },
    ];
    const doctors = [];
    for (const d of doctorData) {
      const doc = await Doctor.create({
        ...d, isActive: true,
        schedule: [
          { day: 'Mon', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, maxAppointments: 8, isAvailable: true },
          { day: 'Tue', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, maxAppointments: 8, isAvailable: true },
          { day: 'Wed', startTime: '14:00', endTime: '18:00', slotDurationMinutes: 30, maxAppointments: 8, isAvailable: true },
          { day: 'Thu', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 30, maxAppointments: 8, isAvailable: true },
          { day: 'Fri', startTime: '09:00', endTime: '17:00', slotDurationMinutes: 30, maxAppointments: 16, isAvailable: true },
        ]
      });
      doctors.push(doc);
    }
    console.log('Doctors seeded');

    // === Patients ===
    const patientData = [
      { name: 'John Doe', dob: new Date('1990-05-15'), age: 35, gender: 'Male', bloodGroup: 'O+', phone: '9988776655', email: 'john@gmail.com', address: { street: '12 MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }, userId: patientUser._id },
      { name: 'Anita Desai', dob: new Date('1985-08-22'), age: 40, gender: 'Female', bloodGroup: 'A+', phone: '9988776656', email: 'anita@gmail.com', address: { street: '45 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016' } },
      { name: 'Vikram Singh', dob: new Date('1978-03-10'), age: 47, gender: 'Male', bloodGroup: 'B+', phone: '9988776657', email: 'vikram@gmail.com', address: { street: '78 Nehru Place', city: 'Delhi', state: 'Delhi', pincode: '110019' } },
      { name: 'Meera Patel', dob: new Date('1995-12-01'), age: 30, gender: 'Female', bloodGroup: 'AB-', phone: '9988776658', email: 'meera@gmail.com', address: { street: '23 SV Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400058' } },
      { name: 'Ravi Shankar', dob: new Date('1968-07-19'), age: 57, gender: 'Male', bloodGroup: 'O-', phone: '9988776659', email: 'ravi@gmail.com', address: { street: '56 Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040' } },
      { name: 'Sunita Reddy', dob: new Date('1992-11-30'), age: 33, gender: 'Female', bloodGroup: 'A-', phone: '9988776660', email: 'sunita@gmail.com', address: { street: '34 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033' } },
      { name: 'Arun Mathew', dob: new Date('1982-02-14'), age: 44, gender: 'Male', bloodGroup: 'B-', phone: '9988776661', email: 'arun@gmail.com', address: { street: '90 MG Road', city: 'Kochi', state: 'Kerala', pincode: '682011' } },
      { name: 'Kavita Joshi', dob: new Date('2000-06-25'), age: 25, gender: 'Female', bloodGroup: 'O+', phone: '9988776662', email: 'kavita@gmail.com', address: { street: '12 MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001' } },
    ];
    const patients = [];
    for (const p of patientData) {
      patients.push(await Patient.create({ ...p, isActive: true }));
    }
    console.log('Patients seeded');

    // === Appointments ===
    const today = new Date();
    const appts = [
      { patientId: patients[0]._id, doctorId: doctors[0]._id, departmentId: departments[1]._id, date: today, timeSlot: '09:00 - 09:30', type: 'in-person', status: 'scheduled', reason: 'Chest pain follow-up' },
      { patientId: patients[1]._id, doctorId: doctors[2]._id, departmentId: departments[0]._id, date: today, timeSlot: '10:00 - 10:30', type: 'in-person', status: 'completed', reason: 'General checkup' },
      { patientId: patients[2]._id, doctorId: doctors[1]._id, departmentId: departments[2]._id, date: today, timeSlot: '11:00 - 11:30', type: 'teleconsultation', status: 'scheduled', reason: 'Migraine consultation' },
      { patientId: patients[3]._id, doctorId: doctors[4]._id, departmentId: departments[7]._id, date: new Date(today.getTime() + 86400000), timeSlot: '09:00 - 09:30', type: 'in-person', status: 'scheduled', reason: 'Skin rash' },
      { patientId: patients[4]._id, doctorId: doctors[3]._id, departmentId: departments[4]._id, date: new Date(today.getTime() + 86400000), timeSlot: '14:00 - 14:30', type: 'in-person', status: 'scheduled', reason: 'Knee pain' },
    ];
    for (const a of appts) { await Appointment.create(a); }
    console.log('Appointments seeded');

    // === Medicines ===
    const medicineData = [
      { genericName: 'Paracetamol', brandName: 'Crocin', category: 'Analgesic', manufacturer: 'GSK', unit: 'Tablet' },
      { genericName: 'Amoxicillin', brandName: 'Mox', category: 'Antibiotic', manufacturer: 'Cipla', unit: 'Capsule' },
      { genericName: 'Metformin', brandName: 'Glycomet', category: 'Antidiabetic', manufacturer: 'USV', unit: 'Tablet' },
      { genericName: 'Amlodipine', brandName: 'Amlong', category: 'Antihypertensive', manufacturer: 'Micro Labs', unit: 'Tablet' },
      { genericName: 'Omeprazole', brandName: 'Omez', category: 'Gastrointestinal', manufacturer: 'Dr Reddy', unit: 'Capsule' },
      { genericName: 'Cetirizine', brandName: 'Cetzine', category: 'Anti-inflammatory', manufacturer: 'Alkem', unit: 'Tablet' },
      { genericName: 'Atorvastatin', brandName: 'Atorva', category: 'Cardiovascular', manufacturer: 'Zydus', unit: 'Tablet' },
      { genericName: 'Azithromycin', brandName: 'Azithral', category: 'Antibiotic', manufacturer: 'Alembic', unit: 'Tablet' },
      { genericName: 'Ibuprofen', brandName: 'Brufen', category: 'Analgesic', manufacturer: 'Abbott', unit: 'Tablet' },
      { genericName: 'Vitamin D3', brandName: 'D-Rise', category: 'Vitamins & Supplements', manufacturer: 'USV', unit: 'Capsule' },
    ];
    const medicines = [];
    for (const m of medicineData) { medicines.push(await Medicine.create({ ...m, isActive: true })); }
    console.log('Medicines seeded');

    // === Pharmacy Stock ===
    for (let i = 0; i < medicines.length; i++) {
      await PharmacyStock.create({
        medicineId: medicines[i]._id,
        batchNumber: `BATCH-2026-${String(i + 1).padStart(3,'0')}`,
        manufacturingDate: new Date('2025-06-01'),
        expiryDate: new Date('2027-06-01'),
        quantityInStock: i < 3 ? 5 : 150 + (i * 20),
        lowStockThreshold: 10,
        purchasePrice: 20 + (i * 5),
        sellingPrice: 35 + (i * 8),
        supplier: ['MedSupply Co','PharmaDist','HealthLine'][i % 3]
      });
    }
    console.log('Pharmacy stock seeded');

    // === Clinical Trials ===
    const trialData = [
      { name: 'CardioShield Phase III', phase: 'III', sponsor: 'Novartis', principalInvestigatorId: doctors[0]._id, departmentId: departments[1]._id, objectives: 'Evaluate efficacy of CardioShield in reducing cardiac events in high-risk adults', inclusionCriteria: 'Adults 40-70 with history of cardiac events', exclusionCriteria: 'Patients with renal failure', startDate: new Date('2026-01-15'), endDate: new Date('2027-01-15'), targetEnrollment: 200, currentEnrollment: 87, status: 'active' },
      { name: 'NeuroRecover Trial', phase: 'II', sponsor: 'Pfizer', principalInvestigatorId: doctors[1]._id, departmentId: departments[2]._id, objectives: 'Assess neuroprotective effects of NR-201 compound in mild cognitive impairment', inclusionCriteria: 'Adults 30-60 with mild cognitive impairment', exclusionCriteria: 'Patients with active seizure disorder', startDate: new Date('2026-03-01'), endDate: new Date('2027-09-01'), targetEnrollment: 150, currentEnrollment: 32, status: 'recruiting' },
      { name: 'DermaClear Study', phase: 'I', sponsor: 'Christ Hospital Research', principalInvestigatorId: doctors[4]._id, departmentId: departments[7]._id, objectives: 'First-in-human study of topical DC-100 for chronic dermatitis', inclusionCriteria: 'Adults 18-50 with chronic dermatitis', exclusionCriteria: 'Pregnant women, immunocompromised', startDate: new Date('2026-06-01'), endDate: new Date('2027-06-01'), targetEnrollment: 50, currentEnrollment: 0, status: 'planning' },
    ];
    for (const t of trialData) { await ClinicalTrial.create(t); }
    console.log('Clinical trials seeded');

    // === Bills ===
    const billData = [
      { patientId: patients[0]._id, lineItems: [{ type: 'consultation', description: 'Cardiology Consultation', quantity: 1, unitPrice: 800, total: 800 }, { type: 'medicine', description: 'Atorvastatin 30 tabs', quantity: 1, unitPrice: 350, total: 350 }], subtotal: 1150, totalAmount: 1150, amountPaid: 1150, status: 'paid' },
      { patientId: patients[1]._id, lineItems: [{ type: 'consultation', description: 'General Checkup', quantity: 1, unitPrice: 500, total: 500 }], subtotal: 500, totalAmount: 500, amountPaid: 0, status: 'pending' },
      { patientId: patients[4]._id, lineItems: [{ type: 'consultation', description: 'Ortho Consultation', quantity: 1, unitPrice: 900, total: 900 }, { type: 'lab', description: 'X-Ray Knee', quantity: 1, unitPrice: 600, total: 600 }, { type: 'medicine', description: 'Ibuprofen', quantity: 1, unitPrice: 120, total: 120 }], subtotal: 1620, totalAmount: 1620, amountPaid: 900, status: 'partiallyPaid' },
    ];
    for (const b of billData) { await Bill.create(b); }
    console.log('Bills seeded');

    console.log('\n✅ Seeding complete!');
    console.log('Admin: admin@christhospital.in / admin123');
    console.log('Patient: john@gmail.com / patient123');
    console.log(`Seeded: ${departments.length} depts, ${doctors.length} doctors, ${patients.length} patients, ${medicines.length} medicines, 3 trials, 3 bills`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

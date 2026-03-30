# Product Requirements Document
# Christ Hospital — Integrated Hospital Management System

---

> **Document Version:** 1.0  
> **Date:** March 30, 2026  
> **Status:** Draft  
> **Project Codename:** CHIMS (Christ Hospital Integrated Management System)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [User Roles & Access Control](#4-user-roles--access-control)
5. [Authentication & Login Flow](#5-authentication--login-flow)
6. [Module Breakdown](#6-module-breakdown)
   - 6.1 [Admin Dashboard](#61-admin-dashboard)
   - 6.2 [Patient Management](#62-patient-management)
   - 6.3 [Doctor & Staff Management](#63-doctor--staff-management)
   - 6.4 [Appointment Scheduling](#64-appointment-scheduling)
   - 6.5 [Prescription & Medicine Management](#65-prescription--medicine-management)
   - 6.6 [Pharmacy Management](#66-pharmacy-management)
   - 6.7 [Clinical Trials Management](#67-clinical-trials-management)
   - 6.8 [Billing & Finance](#68-billing--finance)
   - 6.9 [User (Patient) Portal](#69-user-patient-portal)
7. [Data Models (MongoDB Schemas)](#7-data-models-mongodb-schemas)
8. [API Endpoints](#8-api-endpoints)
9. [Design System & UI Guidelines](#9-design-system--ui-guidelines)
10. [Inter-Module Interactions](#10-inter-module-interactions)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Tech Stack](#12-tech-stack)
13. [Milestones & Delivery Roadmap](#13-milestones--delivery-roadmap)
14. [Appendix](#14-appendix)

---

## 1. Executive Summary

**Christ Hospital** requires a fully integrated, web-based Hospital Management System (CHIMS) that unifies clinical operations, pharmacy management, and clinical trial tracking into a single coherent platform. The system is designed with a **dual-portal architecture** — a powerful **Admin Portal** for staff and management, and a clean **User (Patient) Portal** for patients to access their health information and hospital services.

All modules in CHIMS are deeply interconnected: a doctor's prescription directly queries the pharmacy's live inventory, clinical trial enrollment links to patient records, appointment bookings surface in the doctor's daily schedule, and billing pulls from pharmacy dispensing and procedure logs — creating a single source of truth for Christ Hospital's entire clinical ecosystem.

---

## 2. Product Vision & Goals

### Vision Statement
> *"To provide Christ Hospital with a seamlessly integrated digital environment where every clinical action, from a doctor's handwritten prescription to a pharmacist dispensing medicine, happens in real time — with complete transparency for patients and total control for administrators."*

### Primary Goals

| Goal | Description |
|---|---|
| **Unified Data Layer** | All hospital data — patients, doctors, medicines, trials — lives in one MongoDB database with well-defined relationships |
| **Role-Based Access** | Admins can create, edit, and delete; Users (patients) can only view their own relevant data |
| **Prescription ↔ Pharmacy Sync** | Doctor prescriptions pull from live pharmacy inventory; unavailable medicines are flagged instantly |
| **Clinical Trial Transparency** | Patients enrolled in trials can view their trial status; admins manage trial cohorts and data |
| **User-Friendly UI** | Clean, accessible, and professional design consistent with a trusted healthcare brand |

---

## 3. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHIMS Platform                           │
│                                                                 │
│   ┌─────────────────────┐     ┌─────────────────────────────┐  │
│   │    Admin Portal     │     │      User (Patient) Portal  │  │
│   │  (Full CRUD Access) │     │      (Read-Only Views)      │  │
│   └────────┬────────────┘     └────────────┬────────────────┘  │
│            │                               │                   │
│   ─────────────────────────────────────────────────────────    │
│            │          REST API Layer        │                   │
│   ─────────────────────────────────────────────────────────    │
│            │                               │                   │
│   ┌────────▼───────────────────────────────▼────────────────┐  │
│   │                    Core Services                        │  │
│   │  Auth │ Patient │ Doctor │ Appointment │ Prescription   │  │
│   │  Pharmacy │ Clinical Trials │ Billing │ Notifications   │  │
│   └─────────────────────────┬───────────────────────────────┘  │
│                             │                                   │
│   ┌─────────────────────────▼───────────────────────────────┐  │
│   │                  MongoDB Database                       │  │
│   │  Collections: users, doctors, patients, medicines,      │  │
│   │  appointments, prescriptions, trials, billing,          │  │
│   │  pharmacyStock, departments, staff                      │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions
- **Database:** MongoDB (NoSQL) with Mongoose ODM
- **Backend:** Node.js + Express.js
- **Frontend:** React.js with React Router v6
- **Auth:** JWT (JSON Web Tokens) with role claims (`admin` / `user`)
- **Real-time:** Socket.IO for live pharmacy stock updates and appointment notifications
- **State Management:** Redux Toolkit (frontend)

---

## 4. User Roles & Access Control

### Role Definitions

| Role | Description | Portal |
|---|---|---|
| **Super Admin** | Full system access — manage all data, users, settings | Admin Portal |
| **Doctor** | View own patients, create prescriptions, view schedules | Admin Portal (restricted) |
| **Pharmacist** | Manage pharmacy stock, dispense medicines, view prescriptions | Admin Portal (restricted) |
| **Lab Technician** | Update lab results, manage clinical trial data entry | Admin Portal (restricted) |
| **Receptionist** | Book appointments, register patients, view schedules | Admin Portal (restricted) |
| **Patient (User)** | View own appointments, prescriptions, trial status, doctor timings | User Portal |

### Permission Matrix

| Feature | Super Admin | Doctor | Pharmacist | Receptionist | Patient |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add/Edit Doctors | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Doctor Timings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Book Appointments | ✅ | ❌ | ❌ | ✅ | ❌ |
| Create Prescriptions | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Medicine Inventory | ✅ | ❌ | ✅ | ❌ | ❌ |
| Dispense Medicines | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Own Prescription | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage Clinical Trials | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Trial Status | ✅ | ✅ | ❌ | ❌ | ✅ |
| View Billing | ✅ | ❌ | ❌ | ✅ | ✅ |
| Edit Billing | ✅ | ❌ | ❌ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Authentication & Login Flow

### Login Screen Design
The login page is the entry point for all users. It features:
- **Christ Hospital** branding (logo, name, tagline)
- Email and Password fields
- A **role selector** — a clean toggle or dropdown: `[ Patient ] [ Staff / Admin ]`
- "Forgot Password" link
- Responsive layout for mobile and desktop

### Authentication Flow

```
1. User visits /login
2. Enters email + password + selects role (User / Admin)
3. System validates credentials against MongoDB `users` collection
4. JWT token issued with payload: { userId, role, name, email }
5. Token stored in localStorage / httpOnly cookie
6. Redirect:
   - role === 'admin' (or sub-role)  →  /admin/dashboard
   - role === 'user' (patient)        →  /portal/home
7. All API requests include Bearer token in Authorization header
8. Backend middleware validates token and checks role on every request
```

### JWT Payload Structure
```json
{
  "userId": "ObjectId",
  "name": "John Doe",
  "email": "john@christhospital.in",
  "role": "doctor",
  "department": "Cardiology",
  "iat": 1711800000,
  "exp": 1711886400
}
```

### Password Security
- Passwords hashed with **bcrypt** (salt rounds: 12)
- Password reset via email OTP (6-digit, 10-minute expiry)
- Account lockout after 5 failed attempts (15-minute cooldown)

---

## 6. Module Breakdown

---

### 6.1 Admin Dashboard

**Purpose:** Central command center for administrators and staff.

#### Features
- **Summary Cards (KPI widgets):**
  - Total Patients Today
  - Appointments (Today / This Week)
  - Medicines Low in Stock (alert badge)
  - Active Clinical Trials
  - Pending Bills
- **Activity Feed:** Recent appointments booked, prescriptions created, stock updates
- **Quick Actions:** Add Patient, Book Appointment, Add Medicine, View Reports
- **Charts:**
  - Patient admissions trend (line chart, 30 days)
  - Department-wise appointment distribution (donut chart)
  - Pharmacy stock levels by category (bar chart)
- **Alerts Panel:** Low stock warnings, upcoming trial deadlines, overdue bills

#### Admin Navigation Sidebar
```
🏥 Christ Hospital
─────────────────
📊 Dashboard
👥 Patients
🩺 Doctors & Staff
📅 Appointments
💊 Prescriptions
🧪 Pharmacy
🔬 Clinical Trials
🧾 Billing
⚙️  Settings
```

---

### 6.2 Patient Management

**Purpose:** Maintain complete patient records — demographics, history, visits.

#### Admin Features (CRUD)
- **Register New Patient:**
  - Full name, DOB, gender, blood group
  - Contact details (phone, email, address)
  - Emergency contact
  - Insurance details (provider, policy number)
  - System auto-generates a unique **Patient ID** (`CHR-YYYY-XXXXX`)
- **View Patient Profile:**
  - Personal details tab
  - Visit history (linked appointments)
  - Prescription history (linked prescriptions)
  - Lab reports
  - Clinical trial enrollment (if any)
  - Billing summary
- **Edit Patient Record** — update demographics, insurance
- **Deactivate / Archive Patient** — soft delete, data retained
- **Search & Filter:** by name, ID, blood group, department, date of visit

#### Patient List View
- Paginated table: ID | Name | Age | Blood Group | Last Visit | Status | Actions
- Export to CSV/PDF

---

### 6.3 Doctor & Staff Management

**Purpose:** Manage doctor profiles, schedules, departments, and specialisations.

#### Admin Features (CRUD)
- **Add Doctor / Staff:**
  - Name, qualification, specialisation
  - Department assignment
  - Employee ID (auto-generated: `CHR-DOC-XXXX`)
  - Contact, email, photo upload
  - Consultation fee
- **Doctor Schedule Management:**
  - Weekly schedule builder: select days + time slots (e.g., Mon–Fri, 9:00 AM – 1:00 PM)
  - Break times, holidays, leave management
  - Max appointments per slot
- **Department Management:**
  - Create/edit departments (Cardiology, Neurology, Oncology, etc.)
  - Assign HOD (Head of Department)
- **Search & Filter:** by name, department, specialisation, availability

#### User (Patient) View — Doctor Directory
- Browse doctors by department
- View doctor name, specialisation, qualifications, **available timings**
- View consultation fee
- No edit access

---

### 6.4 Appointment Scheduling

**Purpose:** Book, manage, and track patient appointments with doctors.

#### Admin / Receptionist Features
- **Book Appointment:**
  - Select patient (search by name or ID)
  - Select department → select doctor → view available slots
  - Pick date and time slot
  - Appointment type: In-person / Teleconsultation
  - Add notes / reason for visit
  - System checks: slot availability, doctor schedule, patient conflicts
- **Appointment List View:**
  - Filter by date, doctor, department, status (Scheduled / Completed / Cancelled / No-Show)
  - Calendar view (day / week / month)
  - Status update: Mark as Completed, Cancel, Reschedule
- **Doctor's Daily Schedule View:**
  - Timeline of appointments for selected doctor
  - Quick access to patient profile from appointment card
- **Notifications:**
  - Appointment confirmation (email/SMS to patient)
  - Reminder 24 hours before appointment
  - Doctor notification on new booking

#### User (Patient) View
- View upcoming appointments
- View past appointment history
- See doctor name, timing, department for each booking
- Cannot book — patient must call or visit reception (or future self-booking feature)

---

### 6.5 Prescription & Medicine Management

**Purpose:** Enable doctors to create digital prescriptions from a live medicine inventory, ensuring only available medicines are prescribed.

#### Prescription Creation Flow (Doctor / Admin)

```
Doctor opens Patient Profile
  ↓
Clicks "New Prescription"
  ↓
Prescription Form opens:
  - Diagnosis / Chief Complaint (text)
  - Add Medicines (from pharmacy inventory):
      → Search by medicine name or generic name
      → System shows: Name | Category | Stock | Unit Price
      → Only in-stock medicines shown (stock > 0)
      → Select medicine → enter dosage, frequency, duration, instructions
      → Add multiple medicines to prescription
  - Lab Tests ordered (optional)
  - Doctor Notes / Follow-up date
  ↓
Submit Prescription
  ↓
Prescription saved to MongoDB
  ↓
Linked to Patient Record + Sent to Pharmacy Queue
  ↓
Patient notified (if teleconsultation)
```

#### Prescription Document
Each prescription includes:
- Christ Hospital header (logo, address, contact)
- Patient details (name, age, ID, blood group)
- Doctor details (name, qualification, registration number)
- Date and Appointment ID
- Diagnosis
- Medicine table: Medicine | Dosage | Frequency | Duration | Instructions
- Lab orders
- Doctor signature block
- Unique Prescription ID (`CHR-RX-YYYY-XXXXX`)
- Printable / PDF downloadable

#### Medicine Database (Admin CRUD)
- Add medicines with: Generic name, Brand name, Category (Antibiotic, Analgesic, etc.), Manufacturer, Unit, Unit price
- This is the master list that the pharmacy stock is built on

---

### 6.6 Pharmacy Management

**Purpose:** Manage the hospital pharmacy's complete inventory lifecycle — from stock intake to dispensing — tightly integrated with the prescription system.

#### Admin / Pharmacist Features

##### Inventory Management
- **Add Stock / Medicine Entry:**
  - Select medicine from master list (or add new)
  - Batch number, manufacturing date, expiry date
  - Quantity received, purchase price, selling price
  - Supplier details
- **Stock Overview Dashboard:**
  - Total SKUs in stock
  - Low stock alerts (below threshold)
  - Expiring soon (within 30 days)
  - Out of stock items
- **Stock Adjustment:** manual correction entries with reason log
- **Supplier Management:** maintain supplier list, contact, lead time

##### Dispensing (linked to Prescriptions)
- Pharmacist views **Prescription Queue** — all submitted prescriptions pending dispensing
- Opens prescription → sees medicines ordered
- For each medicine:
  - System shows available stock
  - Pharmacist enters quantity to dispense
  - Can substitute with generic if branded unavailable (logged)
  - System deducts quantity from stock automatically
- Marks prescription as "Dispensed"
- Generates dispensing receipt — linked to billing

##### Alerts & Reports
- Daily dispensing log
- Monthly consumption report by category
- Expiry alert list
- Reorder suggestions (based on consumption rate and current stock)

#### Pharmacy ↔ Prescription Integration Rule
> When a doctor opens the prescription form, the medicine search queries **only medicines with `stockQuantity > 0`** from the `pharmacyStock` collection. This ensures that no prescription is written for an out-of-stock medicine. If stock drops to zero after a prescription is written but before dispensing, the pharmacist is alerted with a substitution prompt.

---

### 6.7 Clinical Trials Management

**Purpose:** Manage the full lifecycle of clinical trials conducted at Christ Hospital — from trial setup to patient enrollment, data collection, and reporting.

#### Admin / Doctor Features

##### Trial Setup
- Create new trial:
  - Trial name, Trial ID (auto: `CHR-CT-YYYY-XXX`)
  - Phase (I / II / III / IV)
  - Sponsor / Funding body
  - Principal Investigator (select from doctor list)
  - Department
  - Objectives, Inclusion criteria, Exclusion criteria
  - Start date, End date
  - Target enrollment (number of patients)
  - Status: Planning / Recruiting / Active / Completed / Suspended
- Upload: trial protocol document (PDF), IRB/Ethics approval document

##### Patient Enrollment
- Search patient by ID
- Check against inclusion/exclusion criteria (system flags)
- Enroll patient → generates Enrollment ID (`CHR-CT-ENR-XXXXX`)
- Record: Consent date, Arm/Group assignment (e.g., Control / Treatment)
- Consent form upload (signed PDF)

##### Trial Data Collection
- Per enrolled patient: add observation records
  - Visit date, Visit type (Screening / Week 4 / Week 8 / Follow-up)
  - Vitals (BP, weight, temperature, etc.)
  - Adverse events (if any) — severity level
  - Lab results (link to lab module)
  - Notes
- Timeline view: all visits and data points for each enrolled patient

##### Trial Dashboard
- Enrolled vs. target count (progress bar)
- Adverse event log
- Milestone tracker
- Download: enrollment summary report, data export (CSV)

#### User (Patient) View
- If enrolled in a trial: see trial name, phase, their enrollment date, arm assignment, next scheduled visit
- Cannot see other patients' data
- Can view: trial objectives (public description only), their own observation history

---

### 6.8 Billing & Finance

**Purpose:** Generate and manage bills for patients, integrating with pharmacy dispensing, procedures, and appointments.

#### Bill Generation
Bills are auto-assembled from:
- **Consultation fee** (from doctor record)
- **Medicines dispensed** (from pharmacy dispensing record)
- **Lab tests ordered** (if applicable)
- **Procedures / surgery charges** (manual entry by admin)
- **Room charges** (if admitted)

#### Bill Lifecycle
```
Draft → Pending → Paid / Partially Paid / Overdue → Settled
```

#### Features
- Create, view, edit bills
- Discount application (with reason and admin approval)
- Insurance claim management — mark covered items, enter insurance amount
- Multiple payment modes: Cash, Card, UPI, Insurance
- Payment receipt generation (printable / PDF)
- Bill summary per patient visit
- Outstanding dues report
- Revenue report by department (monthly)

#### User (Patient) View
- View bills for their visits
- View payment status
- Download receipts
- Cannot edit

---

### 6.9 User (Patient) Portal

**Purpose:** A clean, simple, read-only interface for patients to access their health information at Christ Hospital.

#### User Portal Navigation
```
🏠 Home
📅 My Appointments
💊 My Prescriptions
🧪 My Clinical Trial
🧾 My Bills
🩺 Doctors Directory
👤 My Profile
```

#### Home Screen
- Welcome message: "Welcome back, [Patient Name]"
- Upcoming appointment card (next scheduled)
- Quick links to sections
- Christ Hospital news / health tips (optional CMS block)

#### My Appointments
- List of all appointments (upcoming and past)
- Each card shows: Doctor name, Department, Date, Time, Status, Appointment ID
- View appointment details

#### My Prescriptions
- List of prescriptions by date
- Each prescription shows: Doctor, Date, Diagnosis, Medicines list
- Download prescription as PDF

#### My Clinical Trial (if enrolled)
- Trial name, Phase, Enrollment date
- Arm/group assignment
- Next visit date
- Own observation history (read only)

#### My Bills
- List of bills: Appointment, Amount, Status, Date
- Download receipt

#### Doctors Directory
- Browse by department
- See doctor photo, name, specialisation, qualifications
- **View available timings** (schedule)
- Consultation fee displayed

#### My Profile
- View personal details, blood group, emergency contact
- Can update: phone, email, address (limited self-edit, requires verification)
- Cannot change: medical records, IDs

---

## 7. Data Models (MongoDB Schemas)

### `users` Collection
```js
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['superAdmin', 'doctor', 'pharmacist', 'labTechnician', 'receptionist', 'patient'] },
  patientId: ObjectId,      // if role === 'patient', ref: patients
  doctorId: ObjectId,       // if role === 'doctor', ref: doctors
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### `patients` Collection
```js
{
  _id: ObjectId,
  patientId: { type: String, unique: true },  // CHR-YYYY-XXXXX
  name: String,
  dob: Date,
  age: Number,
  gender: String,
  bloodGroup: String,
  phone: String,
  email: String,
  address: {
    street: String, city: String, state: String, pincode: String
  },
  emergencyContact: { name: String, relation: String, phone: String },
  insurance: { provider: String, policyNumber: String, validUntil: Date },
  userId: ObjectId,         // ref: users
  isActive: Boolean,
  createdAt: Date
}
```

### `doctors` Collection
```js
{
  _id: ObjectId,
  employeeId: { type: String, unique: true },   // CHR-DOC-XXXX
  name: String,
  qualification: [String],
  specialisation: String,
  departmentId: ObjectId,   // ref: departments
  registrationNumber: String,
  phone: String,
  email: String,
  photo: String,            // URL / path
  consultationFee: Number,
  schedule: [
    {
      day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
      startTime: String,    // "09:00"
      endTime: String,      // "13:00"
      slotDurationMinutes: Number,
      maxAppointments: Number,
      isAvailable: Boolean
    }
  ],
  userId: ObjectId,         // ref: users
  isActive: Boolean,
  createdAt: Date
}
```

### `departments` Collection
```js
{
  _id: ObjectId,
  name: String,
  code: String,
  hodId: ObjectId,          // ref: doctors
  description: String,
  isActive: Boolean
}
```

### `appointments` Collection
```js
{
  _id: ObjectId,
  appointmentId: String,    // CHR-APT-YYYY-XXXXX
  patientId: ObjectId,      // ref: patients
  doctorId: ObjectId,       // ref: doctors
  departmentId: ObjectId,   // ref: departments
  date: Date,
  timeSlot: String,         // "10:00 - 10:30"
  type: { type: String, enum: ['in-person', 'teleconsultation'] },
  status: { type: String, enum: ['scheduled','completed','cancelled','no-show'], default: 'scheduled' },
  reason: String,
  notes: String,
  prescriptionId: ObjectId, // ref: prescriptions (filled after visit)
  createdAt: Date,
  updatedAt: Date
}
```

### `medicines` Collection (Master List)
```js
{
  _id: ObjectId,
  genericName: String,
  brandName: String,
  category: String,          // Antibiotic, Analgesic, etc.
  manufacturer: String,
  unit: String,              // Tablet, ml, mg, etc.
  description: String,
  isActive: Boolean
}
```

### `pharmacyStock` Collection
```js
{
  _id: ObjectId,
  medicineId: ObjectId,      // ref: medicines
  batchNumber: String,
  manufacturingDate: Date,
  expiryDate: Date,
  quantityInStock: Number,
  lowStockThreshold: Number,
  purchasePrice: Number,
  sellingPrice: Number,
  supplierId: ObjectId,      // ref: suppliers
  createdAt: Date,
  updatedAt: Date
}
```

### `prescriptions` Collection
```js
{
  _id: ObjectId,
  prescriptionId: String,    // CHR-RX-YYYY-XXXXX
  patientId: ObjectId,       // ref: patients
  doctorId: ObjectId,        // ref: doctors
  appointmentId: ObjectId,   // ref: appointments
  diagnosis: String,
  medicines: [
    {
      medicineId: ObjectId,  // ref: medicines
      medicineName: String,  // denormalized for PDF generation
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }
  ],
  labTestsOrdered: [String],
  notes: String,
  followUpDate: Date,
  dispensingStatus: { type: String, enum: ['pending','dispensed','partial'], default: 'pending' },
  createdAt: Date
}
```

### `dispensingRecords` Collection
```js
{
  _id: ObjectId,
  prescriptionId: ObjectId,  // ref: prescriptions
  patientId: ObjectId,
  pharmacistId: ObjectId,    // ref: users
  dispensedItems: [
    {
      medicineId: ObjectId,
      quantityDispensed: Number,
      stockId: ObjectId,     // ref: pharmacyStock batch
      isSubstituted: Boolean,
      substitutionReason: String
    }
  ],
  dispensedAt: Date,
  totalAmount: Number
}
```

### `clinicalTrials` Collection
```js
{
  _id: ObjectId,
  trialId: String,           // CHR-CT-YYYY-XXX
  name: String,
  phase: { type: String, enum: ['I','II','III','IV'] },
  sponsor: String,
  principalInvestigatorId: ObjectId,  // ref: doctors
  departmentId: ObjectId,
  objectives: String,
  inclusionCriteria: String,
  exclusionCriteria: String,
  startDate: Date,
  endDate: Date,
  targetEnrollment: Number,
  currentEnrollment: Number,
  status: { type: String, enum: ['planning','recruiting','active','completed','suspended'] },
  documents: [{ type: String, url: String }],
  createdAt: Date
}
```

### `trialEnrollments` Collection
```js
{
  _id: ObjectId,
  enrollmentId: String,      // CHR-CT-ENR-XXXXX
  trialId: ObjectId,         // ref: clinicalTrials
  patientId: ObjectId,       // ref: patients
  enrollmentDate: Date,
  armGroup: String,
  consentDate: Date,
  consentDocument: String,
  observations: [
    {
      visitDate: Date,
      visitType: String,
      vitals: {
        bp: String, weight: Number, temperature: Number, heartRate: Number
      },
      adverseEvents: [
        { description: String, severity: String, reportedDate: Date }
      ],
      labResults: [ObjectId],
      notes: String
    }
  ],
  status: { type: String, enum: ['active','completed','withdrawn'] }
}
```

### `bills` Collection
```js
{
  _id: ObjectId,
  billId: String,            // CHR-BILL-YYYY-XXXXX
  patientId: ObjectId,
  appointmentId: ObjectId,
  lineItems: [
    {
      type: { type: String, enum: ['consultation','medicine','lab','procedure','room','other'] },
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }
  ],
  subtotal: Number,
  discount: { amount: Number, reason: String, approvedBy: ObjectId },
  insuranceCovered: Number,
  totalAmount: Number,
  amountPaid: Number,
  status: { type: String, enum: ['draft','pending','paid','partiallyPaid','overdue'] },
  paymentRecords: [
    { amount: Number, mode: String, date: Date, referenceNumber: String }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 8. API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login (email, password, role) |
| POST | `/api/auth/logout` | Authenticated | Logout |
| POST | `/api/auth/forgot-password` | Public | Send OTP to email |
| POST | `/api/auth/reset-password` | Public | Reset with OTP |

### Patients
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/patients` | Admin | List all patients |
| POST | `/api/patients` | Admin | Register new patient |
| GET | `/api/patients/:id` | Admin / Patient (own) | Get patient details |
| PUT | `/api/patients/:id` | Admin | Update patient |
| DELETE | `/api/patients/:id` | Super Admin | Deactivate patient |

### Doctors
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/doctors` | All | List all doctors (public info) |
| GET | `/api/doctors/:id/schedule` | All | Get doctor schedule |
| POST | `/api/doctors` | Super Admin | Add doctor |
| PUT | `/api/doctors/:id` | Super Admin | Edit doctor |

### Appointments
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/appointments` | Admin | All appointments |
| GET | `/api/appointments/patient/:id` | Admin / Patient (own) | Patient's appointments |
| POST | `/api/appointments` | Admin / Receptionist | Book appointment |
| PUT | `/api/appointments/:id/status` | Admin | Update status |

### Prescriptions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/prescriptions` | Doctor / Admin | Create prescription |
| GET | `/api/prescriptions/:id` | Doctor / Admin / Patient (own) | View prescription |
| GET | `/api/prescriptions/patient/:id` | Doctor / Admin / Patient (own) | Patient's prescriptions |

### Pharmacy
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/pharmacy/stock` | Admin / Pharmacist | All stock |
| GET | `/api/pharmacy/stock/available` | Doctor / Admin | In-stock medicines (for prescriptions) |
| POST | `/api/pharmacy/stock` | Admin / Pharmacist | Add stock entry |
| PUT | `/api/pharmacy/stock/:id` | Admin / Pharmacist | Update stock |
| POST | `/api/pharmacy/dispense` | Pharmacist | Dispense prescription |
| GET | `/api/pharmacy/queue` | Pharmacist | Pending dispensing queue |

### Clinical Trials
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/trials` | Admin / Doctor | List all trials |
| POST | `/api/trials` | Admin | Create trial |
| PUT | `/api/trials/:id` | Admin | Edit trial |
| POST | `/api/trials/:id/enroll` | Doctor / Admin | Enroll patient |
| POST | `/api/trials/:trialId/enrollment/:id/observation` | Doctor | Add observation |
| GET | `/api/trials/enrollment/:patientId` | All (own) | Patient's trial info |

### Billing
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/bills/patient/:id` | Admin / Patient (own) | Patient's bills |
| POST | `/api/bills` | Admin / Receptionist | Create bill |
| PUT | `/api/bills/:id/payment` | Admin / Receptionist | Record payment |
| GET | `/api/bills/:id/receipt` | All (own) | Download receipt PDF |

---

## 9. Design System & UI Guidelines

### Brand Identity — Christ Hospital

| Property | Value |
|---|---|
| **Primary Color** | `#1A3C5E` (Deep Navy Blue — trust, authority) |
| **Accent Color** | `#2DB89E` (Teal — health, vitality) |
| **Alert / Danger** | `#E53E3E` |
| **Warning** | `#F6AD55` |
| **Success** | `#38A169` |
| **Background** | `#F7F9FC` (light) / `#FFFFFF` |
| **Text Primary** | `#1A202C` |
| **Text Secondary** | `#718096` |

### Typography
| Use | Font | Weight |
|---|---|---|
| **Logo / Brand** | Playfair Display | Bold 700 |
| **Headings** | Inter | Semi-Bold 600 |
| **Body** | Inter | Regular 400 |
| **Data / Tables** | IBM Plex Mono | Regular 400 |
| **Labels / Chips** | Inter | Medium 500 |

### UI Component Standards

#### Cards
- Subtle shadow: `0 2px 8px rgba(0,0,0,0.08)`
- Border radius: `12px`
- White background, 24px padding

#### Buttons
- Primary: Deep Navy fill, white text, `8px` radius
- Secondary: Teal outline, teal text
- Danger: Red fill
- Disabled: `#E2E8F0` fill, `#A0AEC0` text

#### Forms
- Label above input, always visible
- Input border: `1px solid #CBD5E0`, focused: `2px solid #2DB89E`
- Error state: red border + red helper text below
- Required fields marked with `*`

#### Tables
- Header: `#EBF4FF` background, `#1A3C5E` text
- Alternating row shade: `#FAFAFA`
- Action buttons in last column (View / Edit / Delete)
- Pagination: `< 1 2 3 ... N >`

#### Sidebar (Admin)
- Fixed left sidebar, 240px wide
- Deep navy background `#1A3C5E`
- White icons and labels
- Active item: teal left border + lighter navy background

#### Status Chips / Badges
| Status | Color |
|---|---|
| Scheduled | Blue |
| Completed | Green |
| Cancelled | Red |
| Pending | Orange |
| Active | Teal |
| Suspended | Grey |
| Low Stock | Amber |
| Out of Stock | Red |

### Responsive Breakpoints
- Desktop: ≥ 1200px (full sidebar + content)
- Tablet: 768px – 1199px (collapsible sidebar)
- Mobile: < 768px (bottom nav bar or hamburger menu)

### Accessibility
- All interactive elements: keyboard navigable
- ARIA labels on icon-only buttons
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Form inputs: associated `<label>` elements
- Error messages: not color-only (icon + text)

---

## 10. Inter-Module Interactions

This section explicitly documents the key cross-module data flows that make CHIMS a unified environment.

### Flow 1: Doctor Appointment → Prescription → Pharmacy Dispensing → Billing

```
1. Receptionist books Appointment (Appointment module)
   → Creates Appointment record, notifies doctor

2. Doctor opens Appointment → Clicks "Write Prescription"
   → Prescription form loaded with patient details
   → Medicine search queries pharmacyStock (in-stock only)
   → Doctor adds medicines, diagnosis, notes
   → Prescription saved → Status: pending dispensing

3. Prescription appears in Pharmacy Queue (Pharmacy module)
   → Pharmacist selects prescription
   → Dispenses medicines → Stock quantity decremented
   → Dispensing record created → Prescription status: dispensed

4. Billing module assembles bill:
   → Consultation fee (from Doctor record)
   → Medicines (from Dispensing record × selling price)
   → Bill generated for patient
```

### Flow 2: Patient Registration → Clinical Trial Enrollment

```
1. Admin registers Patient (Patient module)
   → Patient ID generated

2. Doctor creates Clinical Trial (Clinical Trials module)
   → Trial details, inclusion criteria set

3. Doctor enrolls Patient in Trial
   → Patient ID linked to Trial
   → Enrollment record created

4. Patient Portal shows Trial info to enrolled patient
   → Patient can track their visit schedule
```

### Flow 3: Low Stock Alert → Reorder → Stock Update

```
1. Pharmacist dispenses medicines
   → Stock quantity decrements in pharmacyStock

2. System checks: quantity < lowStockThreshold?
   → Yes: alert appears in Admin Dashboard + Pharmacy module

3. Admin / Pharmacist logs new stock purchase
   → Stock quantity updated

4. Medicine becomes available again in prescription search
```

### Flow 4: User Login → Role-Based Routing

```
1. User enters email, password, selects "Patient" on login page
   → JWT issued with role: 'patient'
   → Redirect: /portal/home

2. Staff enters email, password, selects "Staff / Admin"
   → JWT issued with role: 'doctor' / 'pharmacist' / 'superAdmin' / etc.
   → Redirect: /admin/dashboard

3. All API calls carry JWT → middleware reads role → grants/denies access
```

---

## 11. Non-Functional Requirements

### Performance
- Page load time < 2 seconds on standard broadband
- API response time < 500ms for 95th percentile under normal load
- Support up to 500 concurrent users without degradation
- MongoDB indexes on: `patientId`, `doctorId`, `date`, `status`, `medicineId`

### Security
- All data in transit encrypted via HTTPS (TLS 1.3)
- JWT tokens expire in 24 hours; refresh token flow
- bcrypt hashing for all passwords
- Role-based access enforced at API level (not just UI)
- Input validation and sanitisation on all API endpoints (prevent NoSQL injection)
- Rate limiting: 100 requests/minute per IP on auth endpoints
- HIPAA-aligned data handling principles (access logs, data minimisation)

### Reliability & Availability
- Target uptime: 99.9% (< 9 hours downtime/year)
- MongoDB Atlas with automated backups (daily snapshot, 7-day retention)
- Graceful error handling — all errors return structured JSON, never expose stack traces in production

### Scalability
- Horizontal scaling ready (stateless API, JWT-based auth)
- MongoDB Atlas auto-scaling tier support
- Static assets served via CDN

### Audit & Compliance
- All admin CRUD actions logged: `{ userId, action, collection, documentId, timestamp }`
- Audit log queryable by super admin
- Prescription and dispensing records immutable after creation (soft versioning)

---

## 12. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React.js 18 + Vite | Fast, component-based, large ecosystem |
| **Routing** | React Router v6 | Clean nested routing for admin/user split |
| **State** | Redux Toolkit | Predictable global state |
| **UI Library** | Ant Design or Chakra UI | Rich healthcare-grade components |
| **Charts** | Recharts | Lightweight, React-native charts |
| **Backend** | Node.js + Express.js | Familiar, fast, great MongoDB integration |
| **ODM** | Mongoose | Schema validation, middleware hooks |
| **Database** | MongoDB (Atlas) | Flexible schema, scalable |
| **Auth** | JWT + bcrypt | Industry standard, stateless |
| **Real-time** | Socket.IO | Live stock updates, appointment alerts |
| **File Storage** | AWS S3 / Cloudinary | Document uploads (prescriptions, consent forms) |
| **PDF Generation** | Puppeteer / pdfkit | Prescription & bill PDF export |
| **Email/SMS** | Nodemailer + Twilio | Notifications and OTPs |
| **Deployment** | Docker + Nginx | Containerised, reverse-proxied |
| **Hosting** | AWS EC2 / Railway / Render | Flexible deployment |

---

## 13. Milestones & Delivery Roadmap

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Project scaffold (Vite + React + Express + MongoDB)
- [ ] Authentication system (login, JWT, role-based routing)
- [ ] Login page with role selector
- [ ] User management (admin CRUD)
- [ ] Patient registration and profile
- [ ] Department setup

### Phase 2 — Core Clinical (Weeks 4–6)
- [ ] Doctor profiles and schedule management
- [ ] Appointment booking system
- [ ] Doctor directory (user portal)
- [ ] Medicine master list management
- [ ] Prescription creation with live pharmacy integration

### Phase 3 — Pharmacy & Billing (Weeks 7–9)
- [ ] Pharmacy stock management
- [ ] Low stock alerts and expiry tracking
- [ ] Dispensing queue and workflow
- [ ] Billing module
- [ ] Payment recording
- [ ] PDF generation: prescriptions, bills, receipts

### Phase 4 — Clinical Trials & Reporting (Weeks 10–12)
- [ ] Clinical trial setup and management
- [ ] Patient enrollment and consent management
- [ ] Observation data collection
- [ ] Trial reports and exports
- [ ] Admin analytics dashboard (charts)

### Phase 5 — User Portal & Polish (Weeks 13–14)
- [ ] Complete patient portal (all read views)
- [ ] Notification system (email/SMS)
- [ ] Responsive design / mobile optimisation
- [ ] Accessibility audit
- [ ] Performance optimisation

### Phase 6 — QA & Launch (Weeks 15–16)
- [ ] End-to-end testing (all modules)
- [ ] Security audit (pen test, auth review)
- [ ] UAT with Christ Hospital stakeholders
- [ ] Production deployment
- [ ] Documentation and training materials

---

## 14. Appendix

### A. Naming Conventions

| Entity | Format | Example |
|---|---|---|
| Patient ID | `CHR-YYYY-XXXXX` | `CHR-2026-00142` |
| Doctor Employee ID | `CHR-DOC-XXXX` | `CHR-DOC-0047` |
| Appointment ID | `CHR-APT-YYYY-XXXXX` | `CHR-APT-2026-00891` |
| Prescription ID | `CHR-RX-YYYY-XXXXX` | `CHR-RX-2026-00234` |
| Bill ID | `CHR-BILL-YYYY-XXXXX` | `CHR-BILL-2026-00067` |
| Clinical Trial ID | `CHR-CT-YYYY-XXX` | `CHR-CT-2026-003` |
| Enrollment ID | `CHR-CT-ENR-XXXXX` | `CHR-CT-ENR-00018` |

### B. Departments (Initial Setup)

- General Medicine
- Cardiology
- Neurology
- Oncology
- Orthopaedics
- Gynaecology & Obstetrics
- Paediatrics
- Dermatology
- Psychiatry
- Radiology
- Pathology & Laboratory
- Emergency & Trauma

### C. Medicine Categories (Initial Setup)

- Antibiotic
- Analgesic / Antipyretic
- Anti-inflammatory (NSAID)
- Antihypertensive
- Antidiabetic
- Cardiovascular
- Neurological
- Oncology / Chemotherapy
- Vitamins & Supplements
- Topical
- Vaccines
- Ophthalmic
- Gastrointestinal

### D. Glossary

| Term | Definition |
|---|---|
| **CHIMS** | Christ Hospital Integrated Management System |
| **PRD** | Product Requirements Document |
| **JWT** | JSON Web Token — secure, stateless authentication token |
| **ODM** | Object Document Mapper — Mongoose maps JS objects to MongoDB documents |
| **IRB** | Institutional Review Board — ethics body approving clinical trials |
| **HOD** | Head of Department |
| **CRUD** | Create, Read, Update, Delete |
| **OTP** | One-Time Password |
| **PI** | Principal Investigator — lead doctor on a clinical trial |
| **SKU** | Stock Keeping Unit — unique identifier for a medicine-batch combination |

---

*Document prepared for: **Christ Hospital, Internal Development Team***  
*Classification: Internal / Confidential*  
*Next review date: April 30, 2026*

---

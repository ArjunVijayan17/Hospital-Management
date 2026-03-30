const mongoose = require('mongoose');

const clinicalTrialSchema = new mongoose.Schema({
  trialId: { type: String, unique: true },
  name: { type: String, required: true },
  phase: { type: String, enum: ['I', 'II', 'III', 'IV'] },
  sponsor: { type: String },
  principalInvestigatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  objectives: { type: String },
  inclusionCriteria: { type: String },
  exclusionCriteria: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  targetEnrollment: { type: Number, default: 0 },
  currentEnrollment: { type: Number, default: 0 },
  status: { type: String, enum: ['planning', 'recruiting', 'active', 'completed', 'suspended'], default: 'planning' },
  documents: [{ type: String, url: String }]
}, { timestamps: true });

clinicalTrialSchema.pre('save', async function () {
  if (!this.trialId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('ClinicalTrial').countDocuments();
    this.trialId = `CHR-CT-${year}-${String(count + 1).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('ClinicalTrial', clinicalTrialSchema);

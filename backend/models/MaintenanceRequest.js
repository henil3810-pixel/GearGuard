const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
  requestType: {
    type: String,
    enum: ['corrective', 'preventive'],
    required: true,
  },
  maintenanceTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaintenanceTeam',
    required: true,
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'repaired', 'scrap'],
    default: 'new',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // duration in hours or minutes? Let's assume hours for now.
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

module.exports = MaintenanceRequest;

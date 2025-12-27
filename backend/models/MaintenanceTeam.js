const mongoose = require('mongoose');

const maintenanceTeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
  },
  technicians: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

const MaintenanceTeam = mongoose.model('MaintenanceTeam', maintenanceTeamSchema);

module.exports = MaintenanceTeam;

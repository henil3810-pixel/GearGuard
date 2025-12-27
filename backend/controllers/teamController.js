const MaintenanceTeam = require('../models/MaintenanceTeam');
const User = require('../models/User');

// @desc    Create a new maintenance team
// @route   POST /api/teams
// @access  Private/Admin
const createTeam = async (req, res) => {
  const { teamName, technicians } = req.body;

  if (!teamName) {
    return res.status(400).json({ message: 'Please add a team name' });
  }

  // Check if team exists
  const teamExists = await MaintenanceTeam.findOne({ teamName });

  if (teamExists) {
    return res.status(400).json({ message: 'Team already exists' });
  }

  // Validate technicians if provided
  if (technicians && technicians.length > 0) {
    const validTechnicians = await User.find({ _id: { $in: technicians } });
    if (validTechnicians.length !== technicians.length) {
       return res.status(400).json({ message: 'One or more technician IDs are invalid' });
    }
  }

  const team = await MaintenanceTeam.create({
    teamName,
    technicians: technicians || [],
  });

  res.status(201).json(team);
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
  const teams = await MaintenanceTeam.find().populate('technicians', 'name email');
  res.json(teams);
};

// @desc    Assign technicians to a team (Update team)
// @route   PUT /api/teams/:id
// @access  Private/Admin
const updateTeam = async (req, res) => {
  const { teamName, technicians } = req.body;

  const team = await MaintenanceTeam.findById(req.params.id);

  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }

  // Validate technicians if provided
  if (technicians) {
    const validTechnicians = await User.find({ _id: { $in: technicians } });
    if (validTechnicians.length !== technicians.length) {
       return res.status(400).json({ message: 'One or more technician IDs are invalid' });
    }
    team.technicians = technicians;
  }
  
  if (teamName) {
      team.teamName = teamName;
  }

  const updatedTeam = await team.save();
  res.json(updatedTeam);
};

module.exports = {
  createTeam,
  getTeams,
  updateTeam,
};

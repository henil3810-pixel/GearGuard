const User = require('../models/User');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');
const MaintenanceTeam = require('../models/MaintenanceTeam');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (user) {
    user.role = role || user.role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await MaintenanceRequest.countDocuments();
    const openRequests = await MaintenanceRequest.countDocuments({ status: { $in: ['new', 'in-progress'] } });
    const overdueRequests = await MaintenanceRequest.countDocuments({ 
        scheduledDate: { $lt: new Date() },
        status: { $nin: ['repaired', 'scrap'] }
    });
    const lowStockParts = 0; // Placeholder for now as we don't have Parts model yet

    // Aggregations could be added here for more complex stats
    
    res.json({
      totalRequests,
      openRequests,
      overdueRequests,
      lowStockParts, // Optional/Placeholder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get overdue requests
// @route   GET /api/admin/overdue-requests
// @access  Private/Admin
const getOverdueRequests = async (req, res) => {
  try {
    const now = new Date();
    const requests = await MaintenanceRequest.find({
      scheduledDate: { $lt: now },
      status: { $nin: ['repaired', 'scrap'] }
    })
      .populate('equipment', 'name serialNumber department location')
      .populate('maintenanceTeam', 'teamName')
      .populate('assignedTechnician', 'name email')
      .populate('createdBy', 'name email')
      .sort({ scheduledDate: 1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get calendar data (requests by date range)
// @route   GET /api/admin/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access  Private/Admin
const getCalendarData = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start ? new Date(start) : new Date();
    const endDate = end ? new Date(end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const requests = await MaintenanceRequest.find({
      scheduledDate: { $gte: startDate, $lte: endDate }
    })
      .populate('equipment', 'name serialNumber')
      .populate('maintenanceTeam', 'teamName')
      .populate('assignedTechnician', 'name')
      .sort({ scheduledDate: 1 });

    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reports data
// @route   GET /api/admin/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get requests in date range
    const allRequests = await MaintenanceRequest.find({
      createdAt: { $gte: start, $lte: end }
    }).populate('equipment', 'name department').populate('maintenanceTeam', 'teamName');

    // Calculate statistics
    const totalRequests = allRequests.length;
    const byStatus = {
      new: allRequests.filter(r => r.status === 'new').length,
      'in-progress': allRequests.filter(r => r.status === 'in-progress').length,
      repaired: allRequests.filter(r => r.status === 'repaired').length,
      scrap: allRequests.filter(r => r.status === 'scrap').length,
    };
    const byType = {
      corrective: allRequests.filter(r => r.requestType === 'corrective').length,
      preventive: allRequests.filter(r => r.requestType === 'preventive').length,
    };

    // Requests by department
    const byDepartment = {};
    allRequests.forEach(req => {
      const dept = req.equipment?.department || 'Unknown';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    });

    // Requests by team
    const byTeam = {};
    allRequests.forEach(req => {
      const team = req.maintenanceTeam?.teamName || 'Unknown';
      byTeam[team] = (byTeam[team] || 0) + 1;
    });

    res.json({
      period: { start, end },
      totalRequests,
      byStatus,
      byType,
      byDepartment,
      byTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  getDashboardStats,
  getOverdueRequests,
  getCalendarData,
  getReports,
};

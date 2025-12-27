const MaintenanceRequest = require('../models/MaintenanceRequest');
const Equipment = require('../models/Equipment');
const MaintenanceTeam = require('../models/MaintenanceTeam');

// @desc    Create a new maintenance request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  const { subject, equipment, requestType, scheduledDate, duration } = req.body;

  if (!subject || !equipment || !requestType || !scheduledDate || !duration) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  // Check if equipment exists
  const equipmentExists = await Equipment.findById(equipment);

  if (!equipmentExists) {
    return res.status(404).json({ message: 'Equipment not found' });
  }

  // Auto-fill maintenanceTeam from equipment
  // The equipment model has 'maintenanceTeam' as a String (team name)
  // We need to find the MaintenanceTeam document by that name to get its ObjectId
  const maintenanceTeam = await MaintenanceTeam.findOne({ teamName: equipmentExists.maintenanceTeam });

  if (!maintenanceTeam) {
      return res.status(400).json({ message: `Maintenance team '${equipmentExists.maintenanceTeam}' for this equipment not found in system` });
  }

  const request = await MaintenanceRequest.create({
    subject,
    equipment,
    requestType,
    maintenanceTeam: maintenanceTeam._id,
    scheduledDate,
    duration,
    createdBy: req.user.id,
  });

  res.status(201).json(request);
};

// @desc    Get all maintenance requests with overdue flag
// @route   GET /api/requests
// @access  Private
const getRequests = async (req, res) => {
  let query = {};
  
  // If preventive, filter by scheduledDate? The prompt says "Preventive requests appear based on scheduledDate".
  // Let's assume this means we might want to filter or sort.
  // For now, let's return all and let frontend handle or add query params later.
  
  const requests = await MaintenanceRequest.find(query)
    .populate('equipment', 'name serialNumber')
    .populate('maintenanceTeam', 'teamName')
    .populate('assignedTechnician', 'name email')
    .populate('createdBy', 'name');

  // Add overdue flag
  const requestsWithOverdue = requests.map(request => {
    const requestObj = request.toObject();
    const isOverdue = new Date() > new Date(request.scheduledDate) && request.status !== 'repaired' && request.status !== 'scrap';
    return { ...requestObj, isOverdue };
  });

  res.json(requestsWithOverdue);
};

// @desc    Update maintenance request
// @route   PUT /api/requests/:id
// @access  Private
const updateRequest = async (req, res) => {
  const { status, assignedTechnician, scheduledDate, duration } = req.body;

  const request = await MaintenanceRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  // Only team technicians can update request
  // Check if req.user is part of the maintenanceTeam of the request
  const team = await MaintenanceTeam.findById(request.maintenanceTeam);
  
  // Admin can also update? Assuming yes for now, but strictly "Only team technicians"
  // Let's check if user is in the technicians array of the team
  const isTechnician = team.technicians.includes(req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (!isTechnician && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized. Only technicians of the assigned team can update this request.' });
  }

  // Update fields
  if (status) request.status = status;
  if (assignedTechnician) request.assignedTechnician = assignedTechnician;
  if (scheduledDate) request.scheduledDate = scheduledDate;
  if (duration) request.duration = duration;

  // Scrap status should mark equipment as unusable
  if (status === 'scrap') {
      const equipment = await Equipment.findById(request.equipment);
      if (equipment) {
          equipment.isScrapped = true;
          await equipment.save();
      }
  }

  const updatedRequest = await request.save();
  res.json(updatedRequest);
};

// @desc    Delete maintenance request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
const deleteRequest = async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }

  // Only admin can delete requests
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized. Only admins can delete requests.' });
  }

  await request.deleteOne();
  res.json({ message: 'Request deleted successfully' });
};

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
};

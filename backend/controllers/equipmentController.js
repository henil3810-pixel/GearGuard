const Equipment = require('../models/Equipment');

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private
const createEquipment = async (req, res) => {
  const { name, serialNumber, department, maintenanceTeam, location, purchaseDate, warrantyDate } = req.body;

  if (!name || !serialNumber || !department || !maintenanceTeam || !location || !purchaseDate || !warrantyDate) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  const equipmentExists = await Equipment.findOne({ serialNumber });

  if (equipmentExists) {
    return res.status(400).json({ message: 'Equipment with this serial number already exists' });
  }

  const equipment = await Equipment.create({
    name,
    serialNumber,
    department,
    maintenanceTeam,
    location,
    purchaseDate,
    warrantyDate,
  });

  res.status(201).json(equipment);
};

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
const getEquipment = async (req, res) => {
  const equipment = await Equipment.find().populate('assignedUser', 'name email');
  res.json(equipment);
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private/Admin
const updateEquipment = async (req, res) => {
  const { name, serialNumber, department, maintenanceTeam, location, purchaseDate, warrantyDate, assignedUser, isScrapped } = req.body;

  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return res.status(404).json({ message: 'Equipment not found' });
  }

  // Check if serial number is being changed and if it already exists
  if (serialNumber && serialNumber !== equipment.serialNumber) {
    const equipmentExists = await Equipment.findOne({ serialNumber });
    if (equipmentExists) {
      return res.status(400).json({ message: 'Equipment with this serial number already exists' });
    }
    equipment.serialNumber = serialNumber;
  }

  if (name) equipment.name = name;
  if (department) equipment.department = department;
  if (maintenanceTeam) equipment.maintenanceTeam = maintenanceTeam;
  if (location) equipment.location = location;
  if (purchaseDate) equipment.purchaseDate = purchaseDate;
  if (warrantyDate) equipment.warrantyDate = warrantyDate;
  if (assignedUser !== undefined) equipment.assignedUser = assignedUser || null;
  if (isScrapped !== undefined) equipment.isScrapped = isScrapped;

  const updatedEquipment = await equipment.save();
  await updatedEquipment.populate('assignedUser', 'name email');
  res.json(updatedEquipment);
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private/Admin
const deleteEquipment = async (req, res) => {
  const equipment = await Equipment.findById(req.params.id);

  if (!equipment) {
    return res.status(404).json({ message: 'Equipment not found' });
  }

  await equipment.deleteOne();
  res.json({ message: 'Equipment removed' });
};

module.exports = {
  createEquipment,
  getEquipment,
  updateEquipment,
  deleteEquipment,
};

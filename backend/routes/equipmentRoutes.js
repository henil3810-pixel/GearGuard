const express = require('express');
const router = express.Router();
const { createEquipment, getEquipment, updateEquipment, deleteEquipment } = require('../controllers/equipmentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createEquipment)
  .get(protect, getEquipment);

router.route('/:id')
  .put(protect, admin, updateEquipment)
  .delete(protect, admin, deleteEquipment);

module.exports = router;

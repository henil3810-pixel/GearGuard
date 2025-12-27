const express = require('express');
const router = express.Router();
const { createRequest, getRequests, updateRequest, deleteRequest } = require('../controllers/requestController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createRequest)
  .get(protect, getRequests);

router.route('/:id')
  .put(protect, updateRequest)
  .delete(protect, admin, deleteRequest);

module.exports = router;

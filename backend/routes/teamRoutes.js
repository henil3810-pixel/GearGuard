const express = require('express');
const router = express.Router();
const { createTeam, getTeams, updateTeam } = require('../controllers/teamController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createTeam)
  .get(protect, getTeams);

router.route('/:id')
  .put(protect, admin, updateTeam);

module.exports = router;

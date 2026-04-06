const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.post('/create-event', eventController.createEvent);
router.get('/api/staff-events', eventController.getStaffEvents);
router.get('/api/events', eventController.getAllEvents);
router.post('/api/assign-staff', eventController.assignStaff);

module.exports = router;

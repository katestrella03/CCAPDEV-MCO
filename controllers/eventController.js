// Handles event-related logic
const Event = require('../models/Event');

module.exports = {
    createEvent: async (req, res) => {
        const { name, date, startTime, endTime, venue, status } = req.body;
        await Event.create({ name, date, startTime, endTime, venue, status, assignedStaff: [] });
        res.redirect('/manager');
    },
    getStaffEvents: async (req, res) => {
        if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
        const events = await Event.find({ assignedStaff: req.session.user._id }).sort({ date: 1 }).populate('assignedStaff', 'username');
        res.json(events);
    },
    getAllEvents: async (req, res) => {
        const events = await Event.find().populate('assignedStaff', 'username');
        res.json(events);
    },
    assignStaff: async (req, res) => {
        const { eventId, staffIds } = req.body;
        await Event.findByIdAndUpdate(eventId, { assignedStaff: staffIds });
        res.json({ success: true });
    }
};

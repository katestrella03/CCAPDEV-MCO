const express = require('express');
const path = require('path');
const User = require('./models/User');
const Event = require('./models/Event');
require('./config/db');

const app = express();

let currentUser = null; 

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('login');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
        return res.send("Invalid login");
    }

    currentUser = user;

    if (user.role === 'admin') {
        return res.redirect('/admin');
    } else if (user.role === 'manager') {
        return res.redirect('/manager');
    } else {
        return res.redirect('/staff');
    }
});

app.post('/create-user', async (req, res) => {
    const { username, password, role } = req.body;

    await User.create({ username, password, role });

    res.redirect('/admin');
});

app.get('/admin', (req, res) => {
    res.render('admin/admin_dashboard');
});

app.get('/manager', (req, res) => {
    res.render('manager/manager_dashboard');
});

app.get('/staff', (req, res) => {
    res.render('staff/staff_dashboard');
});

app.get('/profile', (req, res) => {
    if (!currentUser) {
        return res.redirect('/');
    }

    res.render('profile', {
        user: {
            username: currentUser.username,
            role: currentUser.role
        }
    });
});

app.get('/messages', (req, res) => {
    res.render('messages');
});

// duplicate profile route removed for clarity (same endpoint already handled above)

app.get('/messages', (req, res) => {
    res.render('messages');
});

app.get('/staffing', (req, res) => {
    res.render('manager/staffing');
});

app.post('/create-event', async (req, res) => {
    const { name, date, startTime, endTime, venue, status } = req.body;

    await Event.create({
        name,
        date,
        startTime,
        endTime,
        venue,
        status,
        assignedStaff: []
    });

    res.redirect('/manager');
});

// API routes for syncing data
app.get('/api/events', async (req, res) => {
    const events = await Event.find().populate('assignedStaff', 'username');
    res.json(events);
});

app.get('/api/staff', async (req, res) => {
    const staff = await User.find({ role: 'staff' });
    res.json(staff);
});

app.post('/api/assign-staff', async (req, res) => {
    const { eventId, staffIds } = req.body;
    await Event.findByIdAndUpdate(eventId, { assignedStaff: staffIds });
    res.json({ success: true });
});


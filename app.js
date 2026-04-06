const express = require('express');
const path = require('path');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
require('./config/db');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use(userRoutes);
app.use(eventRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('login');
});


app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});


app.get('/admin', (req, res) => {
    res.render('admin/admin_dashboard');
});

app.get('/manager', (req, res) => {
    res.render('manager/manager_dashboard');
});

app.get('/staff', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('staff/staff_dashboard', { user: req.session.user });
});

app.get('/schedule', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('staff/schedule', { user: req.session.user });
});

app.get('/messages', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.render('messages');
});

app.get('/staffing', (req, res) => {
    res.render('manager/staffing');
});


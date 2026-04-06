// Handles user-related logic
const User = require('../models/User');

module.exports = {
    login: async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.send('Invalid login');
        req.session.user = user;
        if (user.role === 'admin') return res.redirect('/admin');
        if (user.role === 'manager') return res.redirect('/manager');
        return res.redirect('/staff');
    },
    createUser: async (req, res) => {
        const { username, password, role } = req.body;
        await User.create({ username, password, role });
        res.redirect('/admin');
    },
    profile: (req, res) => {
        if (!req.session.user) return res.redirect('/');
        res.render('profile', { user: req.session.user });
    }
};

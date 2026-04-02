const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://127.0.0.1:27017/mco_db');

const seedUsers = async () => {
    await User.deleteMany();

    await User.insertMany([
        { username: 'admin', password: '123', role: 'admin' },
        { username: 'manager', password: '123', role: 'manager' },
        { username: 'staff', password: '123', role: 'staff' },
        { username: 'staff2', password: '123', role: 'staff' },
        { username: 'manager2', password: '123', role: 'manager' }
    ]);

    console.log('Seed done');
    mongoose.connection.close();
};

seedUsers();
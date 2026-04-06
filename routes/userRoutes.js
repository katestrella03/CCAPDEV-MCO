const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/create-user', userController.createUser);
router.get('/profile', userController.profile);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login route
router.post('/login', authController.login);

// Get user by ID route
router.get('/user/:id', authController.getUserById);

module.exports = router;
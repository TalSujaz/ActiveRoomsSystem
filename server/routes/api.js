const express = require('express');
const router = express.Router();

const areasRoutes = require('./areas.routes');
router.use('/areas', areasRoutes);

const sensorsRoutes = require('./sensors.routes');
router.use('/sensors', sensorsRoutes);

const usersRoutes = require('./users.routes');
router.use('/users', usersRoutes);

const authRoutes = require('./auth.routes');
router.use('/auth', authRoutes);

const sensorManagementRoutes = require('./sensorManagement.routes');
router.use('/management', sensorManagementRoutes);

router.use('/assets', express.static('public/assets'));

module.exports = router;

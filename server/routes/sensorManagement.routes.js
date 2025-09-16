const express = require('express');
const router = express.Router();
const sensorManagementController = require('../controllers/sensorManagement.controller');

// Get all sensors with area information
router.get('/sensors-with-areas', sensorManagementController.getAllSensorsWithAreas);

// Update sensor status
router.put('/sensor/:id/status', sensorManagementController.updateSensorStatus);

// Update sensor coordinates
router.put('/sensor/:id/coordinates', sensorManagementController.updateSensorCoordinates);

// Get sensor statistics
router.get('/statistics', sensorManagementController.getSensorStatistics);

module.exports = router;
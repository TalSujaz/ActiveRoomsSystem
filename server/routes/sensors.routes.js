const express = require('express');
const router = express.Router();
const sensorsController = require('../controllers/sensors.controller');

router.get('/', sensorsController.getAllSensors);
router.get('/:id', sensorsController.getSensorById);
router.get('/:area_id', sensorsController.getSensorsByAreaId);
router.post('/', sensorsController.createSensor);
router.put('/:id', sensorsController.updateSensor);
router.delete('/:id', sensorsController.deleteSensor);

module.exports = router;

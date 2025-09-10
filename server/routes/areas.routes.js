const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areas.controller');
const upload = require('../middleware/upload');

// Serve static files (images)
router.use('/assets', express.static('public/assets'));

router.post('/', upload.single('image'), areasController.createAreaWithImage);
router.put('/:id', upload.single('image'), areasController.updateAreaWithImage);
router.get('/', areasController.getAllAreas);
router.get('/:id', areasController.getAreaById);
router.get('/:inside_of', areasController.getAreaByInsideOf);
router.post('/', areasController.createArea);
router.put('/:id', areasController.updateArea);
router.delete('/:id', areasController.deleteArea);

module.exports = router;

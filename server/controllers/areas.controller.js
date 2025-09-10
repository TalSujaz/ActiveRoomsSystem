const pool = require('../db');
const fs = require('fs');
const path = require('path');
// Get all areas
exports.getAllAreas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM areas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch areas' });
  }
};

// Get area by ID
exports.getAreaById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM areas WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Area not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch area' });
  }
};

// Get area by InsideOf
exports.getAreaByInsideOf = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM areas WHERE inside_of = ?', [req.params.inside_of]);
    if (rows.length === 0) return res.status(404).json({ error: 'Area not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch area' });
  }
};

// Create new area
exports.createArea = async (req, res) => {
  try {
    const { name, area_type, image_path, inside_of, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO areas (name, area_type, image_path, inside_of, description)
       VALUES (?, ?, ?, ?, ?)`,
      [name, area_type, image_path, inside_of, description]
    );

    res.status(201).json({ id: result.insertId, message: 'Area created successfully' });
  } catch (err) {
    console.error(" SQL ERROR:", err); 
    res.status(500).json({ error: 'Failed to create area' });
  }
};


// Update area
exports.updateArea = async (req, res) => {
  try {
    const { name, area_type, image_path, inside_of, description } = req.body;

    const [result] = await pool.query(
      `UPDATE areas SET name=?, area_type=?, image_path=?, inside_of=?, description=?
       WHERE id = ?`,
      [name, area_type, image_path, inside_of, description, req.params.id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Area not found' });

    res.json({ message: 'Area updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update area' });
  }
};

// Delete area
exports.deleteArea = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM areas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Area not found' });

    res.json({ message: 'Area deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete area' });
  }
};

exports.createAreaWithImage = async (req, res) => {
  try {
    const { name, area_type, inside_of, description } = req.body;
    
    // Get image path if file was uploaded
    const image_path = req.file ? `/assets/images/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO areas (name, area_type, image_path, inside_of, description)
       VALUES (?, ?, ?, ?, ?)`,
      [name, area_type, image_path, inside_of, description]
    );

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Area created successfully',
      image_path: image_path
    });
  } catch (err) {
    // Clean up uploaded file if database insert fails
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: 'Failed to create area' });
  }
};

// Update area with optional image upload
exports.updateAreaWithImage = async (req, res) => {
  try {
    const { name, area_type, inside_of, description } = req.body;
    const areaId = req.params.id;

    // Get current area to potentially delete old image
    const [currentArea] = await pool.query('SELECT image_path FROM areas WHERE id = ?', [areaId]);
    if (currentArea.length === 0) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'Area not found' });
    }

    // Use new image path if uploaded, otherwise keep existing
    const image_path = req.file ? `/assets/images/${req.file.filename}` : currentArea[0].image_path;

    const [result] = await pool.query(
      `UPDATE areas SET name=?, area_type=?, image_path=?, inside_of=?, description=?
       WHERE id = ?`,
      [name, area_type, image_path, inside_of, description, areaId]
    );

    // Delete old image if new one was uploaded
    if (req.file && currentArea[0].image_path) {
      const oldImagePath = path.join('public', currentArea[0].image_path);
      fs.unlink(oldImagePath, () => {});
    }

    res.json({ 
      message: 'Area updated successfully',
      image_path: image_path
    });
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: 'Failed to update area' });
  }
};

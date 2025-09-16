const pool = require('../db');

// Get all sensors with area information
exports.getAllSensorsWithAreas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        s.*,
        a.name as area_name,
        a.area_type,
        parent.name as building_name
      FROM sensors s
      LEFT JOIN areas a ON s.area_id = a.id
      LEFT JOIN areas parent ON a.inside_of = parent.id
      ORDER BY parent.name, a.name, s.name
    `);

        res.json({
            success: true,
            sensors: rows
        });
    } catch (err) {
        console.error('Get sensors error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sensors'
        });
    }
};

// Update sensor status
exports.updateSensorStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }

        const [result] = await pool.query(
            'UPDATE sensors SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sensor not found'
            });
        }

        res.json({
            success: true,
            message: 'Sensor status updated successfully'
        });

    } catch (err) {
        console.error('Update sensor status error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update sensor status'
        });
    }
};

// Update sensor coordinates
exports.updateSensorCoordinates = async (req, res) => {
    try {
        const { id } = req.params;
        const { coordinates } = req.body;

        if (!coordinates) {
            return res.status(400).json({
                success: false,
                error: 'Coordinates are required'
            });
        }

        const coordinatesJson = JSON.stringify(coordinates);

        const [result] = await pool.query(
            'UPDATE sensors SET coordinates = ? WHERE id = ?',
            [coordinatesJson, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Sensor not found'
            });
        }

        res.json({
            success: true,
            message: 'Sensor coordinates updated successfully'
        });

    } catch (err) {
        console.error('Update sensor coordinates error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update sensor coordinates'
        });
    }
};

// Get sensor statistics
exports.getSensorStatistics = async (req, res) => {
    try {
        const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_sensors,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_sensors,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_sensors,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error_sensors
      FROM sensors
    `);

        res.json({
            success: true,
            statistics: stats[0]
        });

    } catch (err) {
        console.error('Get sensor statistics error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sensor statistics'
        });
    }
};
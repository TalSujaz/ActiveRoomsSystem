const pool = require('../db');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get users by ID
exports.getuserById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'user not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Get users by UserName+ password
exports.Login = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ? AND password_hash= ?', [req.params.username, req.params.password_hash]);
    if (rows.length === 0) return res.status(404).json({ error: 'user not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Create new users
exports.createUser = async (req, res) => {
  try {
    const { username, email, password_hash, user_type, phone} = req.body;

    const [result] = await pool.query(
      `INSERT INTO users (username, email, password_hash, user_type, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [ username, email, password_hash, user_type, phone]
    );

    res.status(201).json({ id: result.insertId, message: 'user created successfully' });
  } catch (err) {
    console.error(" SQL ERROR:", err); 
    res.status(500).json({ error: 'Failed to create user' });
  }
};


// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, password_hash, user_type, phone} = req.body;

    const [result] = await pool.query(
      `UPDATE users SET username=?, email=?, password_hash=?, user_type=?, phone=?
       WHERE id = ?`,
      [ username, email, password_hash, user_type, phone], req.params.id
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'user not found' });

    res.json({ message: 'user updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE room_id = ?', [req.params.room_id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'user not found' });

    res.json({ message: 'user deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

const bcrypt = require('bcryptjs');
const db = require('../config/db');

// LOGIN
const login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    if (!user_name || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const [rows] = await db.execute('SELECT * FROM users WHERE user_name = ?', [user_name]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid username or password.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid username or password.' });

    req.session.user = { user_id: user.user_id, user_name: user.user_name };
    return res.json({ message: 'Login successful.', user: { user_id: user.user_id, user_name: user.user_name } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// LOGOUT
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully.' });
  });
};

// REGISTER
const register = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    if (!user_name || !password)
      return res.status(400).json({ message: 'Username and password are required.' });

    const [existing] = await db.execute('SELECT user_id FROM users WHERE user_name = ?', [user_name]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Username already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    await db.execute('INSERT INTO users (user_name, password) VALUES (?, ?)', [user_name, hashed]);
    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT user_id, user_name, created_at FROM users');
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE user_id = ?', [id]);
    return res.json({ message: 'User deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, password } = req.body;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      await db.execute('UPDATE users SET user_name=?, password=? WHERE user_id=?', [user_name, hashed, id]);
    } else {
      await db.execute('UPDATE users SET user_name=? WHERE user_id=?', [user_name, id]);
    }
    return res.json({ message: 'User updated.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// SESSION CHECK
const checkSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  }
  return res.json({ loggedIn: false });
};

module.exports = { login, logout, register, getUsers, deleteUser, updateUser, checkSession };

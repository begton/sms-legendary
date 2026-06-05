const express = require('express');
const router = express.Router();
const { login, logout, register, getUsers, deleteUser, updateUser, checkSession } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/login', login);
router.post('/logout', logout);
router.get('/session', checkSession);
router.post('/register', requireAuth, register);
router.get('/users', requireAuth, getUsers);
router.put('/users/:id', requireAuth, updateUser);
router.delete('/users/:id', requireAuth, deleteUser);

module.exports = router;

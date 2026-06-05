const express = require('express');
const router = express.Router();
const { createStockIn, getAllStockIn, getStockInById, updateStockIn, deleteStockIn, getItemNames } = require('../controllers/stockInController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/items', getItemNames);
router.get('/', getAllStockIn);
router.get('/:id', getStockInById);
router.post('/', createStockIn);
router.put('/:id', updateStockIn);
router.delete('/:id', deleteStockIn);

module.exports = router;

const express = require('express');
const router = express.Router();
const { createStockOut, getAllStockOut, getStockOutById, updateStockOut, deleteStockOut, getStockReport, getFullReport } = require('../controllers/stockOutController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/report/daily', getStockReport);
router.get('/report/full', getFullReport);
router.get('/', getAllStockOut);
router.get('/:id', getStockOutById);
router.post('/', createStockOut);
router.put('/:id', updateStockOut);
router.delete('/:id', deleteStockOut);

module.exports = router;

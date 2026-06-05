const db = require('../config/db');

// CREATE stock in
const createStockIn = async (req, res) => {
  try {
    const { itemName, description, quantityIn, supplierName, stockInDate } = req.body;
    const user_id = req.session.user.user_id;

    if (!itemName || !quantityIn || !supplierName || !stockInDate)
      return res.status(400).json({ message: 'All required fields must be filled.' });

    // Get current total for this item
    const [existing] = await db.execute(
      'SELECT SUM(quantityIn) as totalIn FROM stockIn WHERE itemName = ?',
      [itemName]
    );
    const prevTotal = existing[0].totalIn || 0;
    const totalQuantityIn = parseInt(prevTotal) + parseInt(quantityIn);

    await db.execute(
      'INSERT INTO stockIn (user_id, itemName, description, quantityIn, totalQuantityIn, supplierName, stockInDate) VALUES (?,?,?,?,?,?,?)',
      [user_id, itemName, description || '', quantityIn, totalQuantityIn, supplierName, stockInDate]
    );
    return res.status(201).json({ message: 'Stock in recorded successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET ALL stock in
const getAllStockIn = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT si.*, u.user_name 
      FROM stockIn si 
      JOIN users u ON si.user_id = u.user_id
    `;
    const params = [];
    if (search) {
      query += ' WHERE si.itemName LIKE ? OR si.supplierName LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY si.created_at DESC';
    const [rows] = await db.execute(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET single stock in
const getStockInById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT si.*, u.user_name FROM stockIn si JOIN users u ON si.user_id = u.user_id WHERE si.stockIn_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Record not found.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// UPDATE stock in
const updateStockIn = async (req, res) => {
  try {
    const { itemName, description, quantityIn, supplierName, stockInDate } = req.body;
    const { id } = req.params;

    // Recalculate total
    const [existing] = await db.execute(
      'SELECT SUM(quantityIn) as totalIn FROM stockIn WHERE itemName = ? AND stockIn_id != ?',
      [itemName, id]
    );
    const prevTotal = existing[0].totalIn || 0;
    const totalQuantityIn = parseInt(prevTotal) + parseInt(quantityIn);

    await db.execute(
      'UPDATE stockIn SET itemName=?, description=?, quantityIn=?, totalQuantityIn=?, supplierName=?, stockInDate=? WHERE stockIn_id=?',
      [itemName, description || '', quantityIn, totalQuantityIn, supplierName, stockInDate, id]
    );
    return res.json({ message: 'Stock in updated successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE stock in
const deleteStockIn = async (req, res) => {
  try {
    await db.execute('DELETE FROM stockIn WHERE stockIn_id = ?', [req.params.id]);
    return res.json({ message: 'Stock in record deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET unique item names
const getItemNames = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT DISTINCT itemName FROM stockIn ORDER BY itemName');
    return res.json(rows.map(r => r.itemName));
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createStockIn, getAllStockIn, getStockInById, updateStockIn, deleteStockIn, getItemNames };

const db = require('../config/db');

// CREATE stock out
const createStockOut = async (req, res) => {
  try {
    const { stockIn_id, itemName, quantityOut, stockOutDate } = req.body;
    const user_id = req.session.user.user_id;

    if (!stockIn_id || !itemName || !quantityOut || !stockOutDate)
      return res.status(400).json({ message: 'All required fields must be filled.' });

    // Check available stock
    const [inRows] = await db.execute(
      'SELECT SUM(quantityIn) as totalIn FROM stockIn WHERE itemName = ?',
      [itemName]
    );
    const [outRows] = await db.execute(
      'SELECT SUM(quantityOut) as totalOut FROM stockOut WHERE itemName = ?',
      [itemName]
    );
    const totalIn = inRows[0].totalIn || 0;
    const totalOut = outRows[0].totalOut || 0;
    const available = parseInt(totalIn) - parseInt(totalOut);

    if (parseInt(quantityOut) > available)
      return res.status(400).json({ message: `Insufficient stock. Available: ${available}` });

    // Calculate totalQuantityOut for this item
    const totalQuantityOut = parseInt(totalOut) + parseInt(quantityOut);

    await db.execute(
      'INSERT INTO stockOut (user_id, stockIn_id, itemName, quantityOut, totalQuantityOut, stockOutDate) VALUES (?,?,?,?,?,?)',
      [user_id, stockIn_id, itemName, quantityOut, totalQuantityOut, stockOutDate]
    );
    return res.status(201).json({ message: 'Stock out recorded successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET ALL stock out
const getAllStockOut = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT so.*, u.user_name 
      FROM stockOut so 
      JOIN users u ON so.user_id = u.user_id
    `;
    const params = [];
    if (search) {
      query += ' WHERE so.itemName LIKE ?';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY so.created_at DESC';
    const [rows] = await db.execute(query, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// GET single stock out
const getStockOutById = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT so.*, u.user_name FROM stockOut so JOIN users u ON so.user_id = u.user_id WHERE so.stockOut_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Record not found.' });
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// UPDATE stock out
const updateStockOut = async (req, res) => {
  try {
    const { itemName, quantityOut, stockOutDate } = req.body;
    const { id } = req.params;

    // Recalculate totalQuantityOut
    const [outRows] = await db.execute(
      'SELECT SUM(quantityOut) as totalOut FROM stockOut WHERE itemName = ? AND stockOut_id != ?',
      [itemName, id]
    );
    const prevOut = outRows[0].totalOut || 0;
    const totalQuantityOut = parseInt(prevOut) + parseInt(quantityOut);

    await db.execute(
      'UPDATE stockOut SET itemName=?, quantityOut=?, totalQuantityOut=?, stockOutDate=? WHERE stockOut_id=?',
      [itemName, quantityOut, totalQuantityOut, stockOutDate, id]
    );
    return res.json({ message: 'Stock out updated successfully.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DELETE stock out
const deleteStockOut = async (req, res) => {
  try {
    await db.execute('DELETE FROM stockOut WHERE stockOut_id = ?', [req.params.id]);
    return res.json({ message: 'Stock out record deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

// DAILY STOCK STATUS REPORT
const getStockReport = async (req, res) => {
  try {
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    const [rows] = await db.execute(`
      SELECT 
        i.itemName,
        COALESCE(SUM(i.quantityIn), 0) AS totalReceived,
        COALESCE((
          SELECT SUM(o.quantityOut) 
          FROM stockOut o 
          WHERE o.itemName = i.itemName 
            AND DATE(o.stockOutDate) = ?
        ), 0) AS totalIssuedToday,
        COALESCE((SELECT SUM(o2.quantityOut) FROM stockOut o2 WHERE o2.itemName = i.itemName), 0) AS totalIssuedAll,
        COALESCE(SUM(i.quantityIn), 0) - COALESCE((SELECT SUM(o3.quantityOut) FROM stockOut o3 WHERE o3.itemName = i.itemName), 0) AS remainingQty
      FROM stockIn i
      WHERE DATE(i.stockInDate) = ?
      GROUP BY i.itemName

      UNION

      SELECT 
        base.itemName,
        COALESCE((SELECT SUM(si.quantityIn) FROM stockIn si WHERE si.itemName = base.itemName AND DATE(si.stockInDate) = ?), 0) AS totalReceived,
        COALESCE((SELECT SUM(so.quantityOut) FROM stockOut so WHERE so.itemName = base.itemName AND DATE(so.stockOutDate) = ?), 0) AS totalIssuedToday,
        COALESCE((SELECT SUM(so2.quantityOut) FROM stockOut so2 WHERE so2.itemName = base.itemName), 0) AS totalIssuedAll,
        COALESCE((SELECT SUM(si2.quantityIn) FROM stockIn si2 WHERE si2.itemName = base.itemName), 0) - 
        COALESCE((SELECT SUM(so3.quantityOut) FROM stockOut so3 WHERE so3.itemName = base.itemName), 0) AS remainingQty
      FROM (SELECT DISTINCT itemName FROM stockOut WHERE DATE(stockOutDate) = ?) base
      WHERE base.itemName NOT IN (SELECT DISTINCT itemName FROM stockIn WHERE DATE(stockInDate) = ?)
    `, [reportDate, reportDate, reportDate, reportDate, reportDate, reportDate]);

    // Deduplicate by itemName
    const map = {};
    rows.forEach(r => { map[r.itemName] = r; });
    return res.json({ date: reportDate, report: Object.values(map) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// COMPREHENSIVE REPORT (all time)
const getFullReport = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        itemName,
        SUM(quantityIn) AS totalReceived
      FROM stockIn
      GROUP BY itemName
    `);

    const [outRows] = await db.execute(`
      SELECT 
        itemName,
        SUM(quantityOut) AS totalIssued
      FROM stockOut
      GROUP BY itemName
    `);

    const outMap = {};
    outRows.forEach(r => { outMap[r.itemName] = r.totalIssued; });

    const report = rows.map(r => ({
      itemName: r.itemName,
      totalReceived: r.totalReceived,
      totalIssued: outMap[r.itemName] || 0,
      remainingQty: r.totalReceived - (outMap[r.itemName] || 0)
    }));

    return res.json(report);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { createStockOut, getAllStockOut, getStockOutById, updateStockOut, deleteStockOut, getStockReport, getFullReport };

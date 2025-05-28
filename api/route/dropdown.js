const express = require('express');
const router = express.Router();
const database = require('../database');


router.get('/rooms/:dormID', (req, res) => {
  const { dormID } = req.params;
  const sql = `
    SELECT id, roomNo
    FROM dorm_room
    WHERE dormID = ?
    ORDER BY roomNo ASC
  `;
  database.query(sql, [dormID], (err, results) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


router.get('/users/:dormID', (req, res) => {
  const { dormID } = req.params;
  const sql = `
    SELECT 
      ud.userID AS userDormID,
      ud.fullName,
      dr.roomNo,
      CONCAT(COALESCE(dr.roomNo, 'ไม่มีห้อง'), ' - ', ud.fullName) AS label
    FROM user_dorm ud
    LEFT JOIN dorm_room dr ON ud.roomID = dr.id
    WHERE ud.dormID = ? AND ud.role = 'tenant'
    ORDER BY dr.roomNo ASC
  `;

  database.query(sql, [dormID], (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});


module.exports = router;

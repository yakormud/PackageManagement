// routes/dormRoom.js
const express = require('express');
const router = express.Router();
const database = require('../database');

router.get('/getAllRoom/:dormID', (req, res) => {
  const dormID = req.params.dormID;
  const query = 'SELECT id, roomNo FROM dorm_room WHERE dormID = ? ORDER BY roomNo ASC';

  database.query(query, [dormID], (err, result) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(result);
  });
});

router.post('/create', (req, res) => {
  const { dormID, roomNo } = req.body;

  const query = `
    INSERT INTO dorm_room (roomNo, dormID)
    VALUES (?, ?)
  `;

  database.query(query, [roomNo, dormID], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      res.json({ message: 'Room added successfully' });
  });
});

router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { roomNo } = req.body;

  const query = `
    UPDATE dorm_room
    SET roomNo = ?
    WHERE id = ?
  `;

  database.query(query, [roomNo, id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json({ message: 'Room updated successfully' });
  });
});

// Delete room
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    DELETE FROM dorm_room
    WHERE id = ?
  `;

  database.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    res.json({ message: 'Room deleted successfully' });
  });
});

module.exports = router;


module.exports = router;

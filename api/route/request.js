const express = require('express');
const router = express.Router();
const database = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');


function getThaiTimeString() {
  const thaiTime = new Date().toLocaleString('sv-SE', {
    timeZone: 'Asia/Bangkok',
    hour12: false
  });
  return thaiTime.replace(' ', 'T');
}

router.post('/join', authenticateToken, (req, res) => {
  const { fullName, code } = req.body;
  const userID = req.user.id;

  if (!userID || !fullName || !code) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const findDormQuery = 'SELECT id FROM dormitory WHERE inviteCode = ? LIMIT 1';
  database.query(findDormQuery, [code], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Dorm not found' });
    }

    const dormID = result[0].id;

    // เช็คว่าผู้ใช้อยู่ในหอนี้อยู่แล้วหรือยัง
    const checkUserDorm = 'SELECT * FROM user_dorm WHERE userID = ? AND dormID = ? LIMIT 1';
    database.query(checkUserDorm, [userID, dormID], (err2, result2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: 'Database error (user_dorm)' });
      }

      if (result2.length > 0) {
        return res.status(400).json({ message: 'คุณอยู่ในหอนี้อยู่แล้ว' });
      }

      // เช็คว่ามี request เดิมหรือยัง
      const checkRequest = 'SELECT * FROM request WHERE userID = ? AND dormID = ? LIMIT 1';
      database.query(checkRequest, [userID, dormID], (err3, result3) => {
        if (err3) {
          console.error(err3);
          return res.status(500).json({ message: 'Database error (request)' });
        }

        if (result3.length > 0) {
          return res.status(400).json({ message: 'คุณได้ส่งคำขอไปแล้ว' });
        }

        const joinTime = getThaiTimeString();
        // ยังไม่มี request และยังไม่ได้อยู่ในหอ => แทรกคำขอได้
        const insertQuery = `
          INSERT INTO request (userID, fullName, date, status, dormID)
          VALUES (?, ?, ?, 'not_accept', ?)`;

        database.query(insertQuery, [userID, fullName, joinTime, dormID], (err4, result4) => {
          if (err4) {
            console.error(err4);
            return res.status(500).json({ message: 'Failed to save request' });
          }

          res.json({ message: 'ส่งคำขอเรียบร้อยแล้ว' });
        });
      });
    });
  });
});


router.get('/getAllRequestInDorm/:dormId', (req, res) => {
    const dormId = req.params.dormId;

    const query = `SELECT * FROM request WHERE dormID = ?`;
    database.query(query, [dormId], (err, results) => {
        if (err) {
            console.error('Error fetching requests:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        console.log(results)
        res.json(results);
    });
});

router.get('/:id', (req, res) => {
    const requestID = req.params.id;
    const query = 'SELECT * FROM request WHERE id = ? LIMIT 1';

    database.query(query, [requestID], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.length === 0) return res.status(404).json({ message: 'Request not found' });

        res.json(result[0]);
    });
});

router.delete('/deleteRequest/:id', (req, res) => {
    const requestID = req.params.id;
    const query = 'DELETE FROM request WHERE id = ?';

    database.query(query, [requestID], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found' });

        res.json({ message: 'Request deleted successfully' });
    });
});
module.exports = router;

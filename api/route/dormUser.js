// routes/userDorm.js
const express = require('express');
const router = express.Router();
const database = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');

function generateUserCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post('/addUser', (req, res) => {
  const { fullName, role, roomID, userID, dormID } = req.body;
  const code = generateUserCode(); // Generate code here

  const query = 'INSERT INTO user_dorm (fullName, role, roomID, userID, dormID, code) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [fullName, role, roomID, userID, dormID, code];

  database.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding user to dorm:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json({ message: 'User added successfully', code });
  });
});

//get record base on id
router.post('/getById', (req, res) => {
  const { id } = req.body;

  const query = `
    SELECT * FROM user_dorm 
    WHERE id = ?
  `;
  database.query(query, [id], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results[0]);
  });
});


router.post('/getByDormAndRole', (req, res) => {
  const { dormID, role } = req.body;

  const query = `
    SELECT * FROM user_dorm 
    WHERE dormID = ? AND role = ?
  `;
  database.query(query, [dormID, role], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// get with dormName , used in dashboard
router.post('/getByUserID', authenticateToken, (req, res) => {
  const userID = req.user.id;
  const query = `
    SELECT ud.*, dorm.name AS dormName, dorm.pathToPicture 
    FROM user_dorm ud
    LEFT JOIN dormitory dorm ON ud.dormID = dorm.id
    WHERE ud.userID = ?
  `;
  database.query(query, [userID], (err, results) => {
    if (err) return res.status(500).json({ message: err });
    res.json(results);
  });
});

//get qr code 
router.get('/getUserCode/:id', (req, res) => {
  const { id } = req.params;

  const query = `
      SELECT package.*, user_dorm.code
      FROM package
      LEFT JOIN user_dorm 
      ON package.recipientID = user_dorm.userID 
      AND package.dormID = user_dorm.dormID
      WHERE package.id = ?
  `;

  database.query(query, [id], (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Server error' });
      }

      if (results.length > 0) {
          res.json(results[0]); 
          console.log(results[0])
      } else {
          res.status(404).json({ message: 'Package not found' });
      }
  });
});

router.post('/getUserCode', (req, res) => {
  const { userID, id } = req.body;
  const dormID = id;

  const query = `SELECT code FROM user_dorm WHERE userID = ? AND dormID = ? LIMIT 1`;
  database.query(query, [userID, dormID], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Code not found' });
    }
  });
});

router.post('/updateUser', (req, res) => {
  const { id, fullName, role, roomID } = req.body;

  const query = `
    UPDATE user_dorm 
    SET fullName = ?, role = ?, roomID = ? 
    WHERE id = ?
  `;
  database.query(query, [fullName, role, roomID, id], (err) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

router.post('/getAllUser', (req, res) => {

  const { dormID } = req.body;

  const query = `SELECT fullName, userID FROM user_dorm WHERE dormID = ?`;
  
  database.query(query, [dormID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// GET ROLE FOR DORM NAVBAR
router.post('/getUserRoleByDorm', (req, res) => {
  const { userID, dormID } = req.body;
  console.log("userid ",userID)
  console.log("dormID ",dormID)

  const query = `
    SELECT role FROM user_dorm 
    WHERE userID = ? AND dormID = ?
  `;

  database.query(query, [userID, dormID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Role not found' });

    res.json({ role: results[0].role });
  });
});




module.exports = router;

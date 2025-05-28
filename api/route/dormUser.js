// routes/userDorm.js
const express = require('express');
const router = express.Router();
const database = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');

//gen code eiei
function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

//for user_dorm
async function generateUniqueUserCode(dormID) {
    let code;
    let exists = true;

    while (exists) {
        code = generateCode(6);
        if (!dormID) {
            return code;
        }
        const [rows] = await new Promise((resolve, reject) => {
            database.query('SELECT id FROM user_dorm WHERE code = ? AND dormID = ?', [code, dormID], (err, results) => {
                if (err) reject(err);
                else resolve([results]);
            });
        });

        if (rows.length === 0) {
            exists = false;
        }
        console.log("CHECK USER CODE EXISTS: ", exists)
    }

    return code;
}

router.post('/addUser', async (req, res) => {
  const { fullName, role, roomID, userID, dormID } = req.body;
  console.log(req.body)

  //เช็คว่ามีไหม
  const checkQuery = 'SELECT id FROM user_dorm WHERE userID = ? AND dormID = ?';
  database.query(checkQuery, [userID, dormID], async (err, results) => {
    if (err) {
      console.error('Error checking user_dorm:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (results.length > 0) {
      // มี user 
      return res.status(400).json({ message: 'มีผู้ใช้งานคนนี้ในหอพักอยู่แล้ว' });
    }

    const code = await generateUniqueUserCode(dormID);

    const insertQuery = 'INSERT INTO user_dorm (fullName, role, roomID, userID, dormID, code) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [fullName, role, roomID, userID, dormID, code];

    database.query(insertQuery, values, (err2, result) => {
      if (err2) {
        console.error('Error adding user to dorm:', err2);
        return res.status(500).json({ message: 'Server error' });
      }

      res.json({ message: 'User added successfully', code });
    });
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
  const { dormID, role, search } = req.body;
  const searchText = `%${search || ''}%`;

  const query = `
    SELECT ud.*, dr.roomNo
    FROM user_dorm ud
    LEFT JOIN dorm_room dr ON dr.id = ud.roomID
    WHERE ud.dormID = ? AND ud.role = ? AND (
      ud.fullName LIKE ? OR
      dr.roomNo LIKE ?
    )
  `;
  
  database.query(query, [dormID, role, searchText, searchText], (err, results) => {
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
    SELECT ud.*, dorm.name AS dormName, dorm.pathToPicture, dorm.isActive
    FROM user_dorm ud
    LEFT JOIN dormitory dorm ON ud.dormID = dorm.id
    WHERE ud.userID = ? AND dorm.isActive = 1
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

router.post('/getUserCode', authenticateToken, (req, res) => {
  const { dormID } = req.body;
  const userID = req.user.id;

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
    SELECT ud.role , d.isActive
    FROM user_dorm ud
    LEFT JOIN dormitory d ON d.id = ud.dormID
    WHERE userID = ? AND dormID = ? AND d.isActive = 1
  `;

  database.query(query, [userID, dormID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Role not found' });

    res.json({ role: results[0].role });
  });
});

//check ว่า user คนนั้นอยู่ใน dorm หรือไม่
router.post('/checkIfUserInDorm', (req, res) => {
  const { code, dormID } = req.body;

  console.log(code)
  console.log(dormID)

  if (!code || !dormID) {
    return res.status(400).json({ message: 'Missing code or dormID' });
  }

  const query = `
    SELECT ud.fullName, ud.roomID, dr.roomNo, u.email, u.id
    FROM user_dorm ud
    LEFT JOIN dorm_room dr ON dr.id = ud.roomID
    LEFT JOIN user u ON u.id = ud.userID
    WHERE ud.code = ? AND ud.dormID = ? AND ud.roomID IS NOT NULL
  `;

  database.query(query, [code, dormID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found in this dorm' });
    }

    res.json({
      fullName: results[0].fullName,
      id: results[0].id, // userID
      roomID: results[0].roomID,
      roomNo: results[0].roomNo,
      email: results[0].email
    });
  });
});

//delete
router.post('/deleteUser', (req, res) => {
  const { id } = req.body;

  const query = `
    DELETE FROM user_dorm 
    WHERE id = ?
  `;

  database.query(query, [id], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});





module.exports = router;

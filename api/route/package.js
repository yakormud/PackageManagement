const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const database = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');
const getRole = require('../middlewares/getRole');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'packages');
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.post('/add', authenticateToken, upload.single('image'), async (req, res) => {
  const {
    recipientRoomNo,
    recipientName,
    trackingNo,
    dormID
  } = req.body;

  const userID = req.user.id;

  try {
    // Check permission
    const userRole = await getRole(userID, dormID);
    if (!userRole || !['owner', 'manager'].includes(userRole.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const pathToPicture = req.file ? `/packages/${req.file.filename}` : '';

    const insertQuery = `
      INSERT INTO package (
        recipientName,
        recipientRoomNo,
        recipientID,
        trackingNo,
        pathToPicture,
        status,
        registerBy,
        registerTime,
        deliverBy,
        deliverTime,
        receiver,
        dormID
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `;

    const values = [
      recipientName,
      recipientRoomNo,
      userID, // ต้องแก้ ใส่ recipientID
      trackingNo,
      pathToPicture,
      'wait_for_deliver',
      userRole.fullName, // registered by
      '',     // deliverBy
      null,   // deliverTime
      '',     // receiver
      dormID
    ];

    database.query(insertQuery, values, (err, result) => {
      if (err) {
        console.error('Error inserting package:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      res.json({
        message: 'Package added successfully',
        addedBy: userRole.fullName,
        role: userRole.role
      });
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//FOR manager
router.post('/getByDormAndStatus', (req, res) => {
    const { dormID, status } = req.body;

    const query = `
      SELECT * FROM package
      WHERE dormID = ? AND status = ?
    `;
    database.query(query, [dormID, status], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

//FOR tenant
router.post('/getByDormAndStatusAndUserID', (req, res) => {
    const { dormID, status, userID } = req.body;

    const query = `
      SELECT * FROM package
      WHERE dormID = ? AND status = ? AND recipientID = ?
    `;
    database.query(query, [dormID, status, userID], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results);
    });
});

router.post('/getByUserID', (req, res) => {
    const { userID } = req.body;
    const query = `
        SELECT package.*, dorm.name AS dormName
        FROM package
        LEFT JOIN dormitory dorm ON package.dormID = dorm.id
        WHERE recipientID = ?
        ORDER BY dormName
    `;
    database.query(query, [userID], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

router.post('/getByID', (req, res) => {
    const { id } = req.body;
    const query = `
        SELECT * FROM package WHERE id = ?
    `;
    database.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results[0]);

    });
});

// UPDATE
router.post('/update', (req, res) => {
    const { id, recipientID, recipientName, recipientRoomNo, trackingNo, pathToPicture } = req.body;

    const query = `
      UPDATE package 
      SET recipientID = ?, recipientName = ?, recipientRoomNo = ?, trackingNo = ?, pathToPicture = ?
      WHERE id = ?
    `;

    database.query(query, [recipientID, recipientName, recipientRoomNo, trackingNo, pathToPicture, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Database update failed' });
        }
        res.json({ message: 'Package updated successfully' });
    }
    );
});


router.post('/checkIfExist', (req, res) => {
  const { trackingNo } = req.body;
  if (!trackingNo) {
    return res.status(400).json({ message: 'trackingNo is required' });
  }

  const query = `
    SELECT * FROM package
    WHERE trackingNo = ? AND status = 'wait_for_deliver'
  `;

  database.query(query, [trackingNo], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    console.log(results)
    res.json(results);
  });
});




module.exports = router;

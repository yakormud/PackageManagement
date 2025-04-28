const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const database = require('../database');


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

router.post('/add', upload.single('image'), (req, res) => {
    const {
        recipientRoomNo,
        recipientName,
        trackingNo,
    } = req.body;

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
        1, // mock recipientID
        trackingNo,
        pathToPicture,
        'wait_for_deliver',
        1, // mock registerBy
        '', // deliverBy
        null, // deliverTime
        '', // receiver
        1  // mock dormID
    ];

    database.query(insertQuery, values, (err, result) => {
        if (err) {
            console.error('Error inserting package:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ message: 'Package added successfully' });
    });
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




module.exports = router;

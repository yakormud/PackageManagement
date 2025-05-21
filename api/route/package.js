const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const database = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');
const getRole = require('../middlewares/getRole');
const { sendEmail } = require('../email/emailService');

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

function getThaiTimeString() {
  const thaiTime = new Date().toLocaleString('sv-SE', {
    timeZone: 'Asia/Bangkok',
    hour12: false
  });
  return thaiTime.replace(' ', 'T');
}

function formatThaiDateTime(isoString) {
  const date = new Date(isoString);

  // แปลงเป็นเวลาประเทศไทย
  const thaiDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }));

  const day = thaiDate.getDate();
  const month = thaiDate.getMonth(); // 0-indexed
  const year = thaiDate.getFullYear() + 543;
  const hours = thaiDate.getHours().toString().padStart(2, '0');
  const minutes = thaiDate.getMinutes().toString().padStart(2, '0');

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${day} ${thaiMonths[month]} ${year} ${hours}:${minutes} น.`;
}

router.post('/add', authenticateToken, upload.single('image'), async (req, res) => {
  const {
    recipientRoomNo,
    recipientName,
    recipientID,
    trackingNo,
    dormID
  } = req.body;

  const userID = req.user.id;

  try {
    const userRole = await getRole(userID, dormID);
    if (!userRole || !['owner', 'manager'].includes(userRole.role)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const pathToPicture = req.file ? `/packages/${req.file.filename}` : '';
    const registerTime = getThaiTimeString();

    // Insert package
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      recipientName,
      recipientRoomNo,
      recipientID,
      trackingNo,
      pathToPicture,
      'wait_for_deliver',
      userRole.fullName,
      registerTime,
      '', null, '', dormID
    ];

    database.query(insertQuery, values, async (err, result) => {
      if (err) {
        console.error('Error inserting package:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      try {
        // ดึงอีเมลผู้รับ
        const [userRow] = await new Promise((resolve, reject) => {
          database.query(`SELECT email FROM user WHERE id = ? LIMIT 1`, [recipientID], (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });

        if (!userRow?.email) {
          console.log('ไม่พบอีเมลของผู้รับ');
          return res.json({ message: 'เพิ่มพัสดุแล้ว (ไม่พบอีเมล)' });
        }

        // ดึงชื่อหอพัก
        const [dormRow] = await new Promise((resolve, reject) => {
          database.query(`SELECT name FROM dormitory WHERE id = ? LIMIT 1`, [dormID], (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });

        const dormName = dormRow?.name || 'ไม่ทราบชื่อหอพัก';

        // นับพัสดุที่รอรับ
        const [countRow] = await new Promise((resolve, reject) => {
          database.query(`
            SELECT COUNT(*) AS count
            FROM package
            WHERE recipientID = ? AND dormID = ? AND status = 'wait_for_deliver'
          `, [recipientID, dormID], (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });

        const count = countRow?.count || 0;

        const thaiTime = formatThaiDateTime(registerTime);

        // ส่งอีเมล
        const mailOptions = {
          from: `"Dormitory Admin" <test@gmail.com>`,
          to: userRow.email,
          subject: 'เจ้าหน้าที่ได้เพิ่มรายการพัสดุของคุณ',
          html: `
            <p>เรียนคุณ <strong>${recipientName}</strong>,</p>
            <p>เจ้าหน้าที่ <strong>${userRole.fullName}</strong> ได้เพิ่มรายการพัสดุของคุณลงในหอพัก <strong>${dormName}</strong>:</p>
            <ul>
              <li><strong>หมายเลขพัสดุ:</strong> ${trackingNo}</li>
              <li><strong>ชื่อผู้รับ:</strong> ${recipientName}</li>
              <li><strong>หมายเลขห้อง:</strong> ${recipientRoomNo}</li>
              <li><strong>เพิ่มเมื่อ:</strong> ${thaiTime}</li>
            </ul>
            <p>ขณะนี้คุณมีพัสดุรอรับทั้งหมด <strong>${count} ชิ้น ในหอพักนี้ </strong></p>
          `
        };

        await sendEmail(mailOptions);
        console.log(`📧 Email sent to ${userRow.email}`);

        res.json({
          message: 'Package added and email sent',
          addedBy: userRole.fullName,
          role: userRole.role
        });

      } catch (emailErr) {
        console.error('Error sending email:', emailErr);
        res.json({
          message: 'Package added, but failed to send email',
          error: emailErr.message
        });
      }
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//FOR manager
router.post('/getByDormAndStatus', (req, res) => {
  const { dormID, status, search, limit = 10, offset = 0, date } = req.body;
  const searchText = `%${search || ''}%`;

  let query = `
    SELECT * FROM package
    WHERE dormID = ? AND status = ?
    AND (
      recipientName LIKE ? OR
      recipientRoomNo LIKE ? OR
      trackingNo LIKE ?
    )
  `;
  const params = [dormID, status, searchText, searchText, searchText];

  const timeField = status === 'delivered' ? 'deliverTime' : 'registerTime';

  if (date) {
    query += ` AND DATE(${timeField}) = ?`;
    params.push(date); // 'YYYY-MM-DD'
  }

  query += ` ORDER BY ${timeField} DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  database.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// นับจำนวนพัสดุ
router.post('/getByDormAndStatus/count', (req, res) => {
  const { dormID, status, search, date } = req.body;
  const searchText = `%${search || ''}%`;

  const timeField = status === 'delivered' ? 'deliverTime' : 'registerTime';

  let query = `
    SELECT COUNT(*) AS total FROM package
    WHERE dormID = ? AND status = ?
    AND (
      recipientName LIKE ? OR
      recipientRoomNo LIKE ? OR
      trackingNo LIKE ?
    )
  `;
  const params = [dormID, status, searchText, searchText, searchText];

  if (date) {
    query += ` AND DATE(${timeField}) = ?`;
    params.push(date);
  }

  database.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results[0]); // { total: ... }
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

router.post('/getByUserID', authenticateToken, (req, res) => {
  const userID = req.user.id;
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
const fs = require('fs');

router.post('/update', upload.single('image'), async (req, res) => {
  const {
    id,
    recipientID,
    recipientName,
    recipientRoomNo,
    trackingNo,
    oldPath,
    deleteImage,
  } = req.body;

  try {
    let pathToPicture = oldPath;

    // ถ้ามีไฟล์ภาพใหม่
    if (req.file) {
      pathToPicture = `/packages/${req.file.filename}`;

      // ลบไฟล์ภาพเก่า (ถ้าไม่ใช่ default)
      if (oldPath) {
        const oldFilePath = path.join(__dirname, '..', oldPath);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      }
    } else {
      if (deleteImage === 'true') {
        console.log(oldPath)
        console.log("DELETE OLD IMAGE PATH")
        pathToPicture = ''; //เอาไว้ set ลง db
        const oldFilePath = path.join(__dirname, '..', oldPath);
        fs.unlink(oldFilePath, (err) => {
          if (err) console.error('Error deleting image:', err);
        });
      }
    }

    database.query(`
      UPDATE package SET
        recipientID = ?,
        recipientName = ?,
        recipientRoomNo = ?,
        trackingNo = ?,
        pathToPicture = ?
      WHERE id = ?
    `, [recipientID, recipientName, recipientRoomNo, trackingNo, pathToPicture, id]);

    res.json({ message: 'อัปเดตพัสดุเรียบร้อยแล้ว' });
  } catch (err) {
    console.error('Update package error:', err);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตพัสดุได้' });
  }
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

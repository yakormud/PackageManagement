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
    try {
      const uniqueName = Date.now() + generateCode() + path.extname(file.originalname);
      cb(null, uniqueName);
      console.log(uniqueName);
    } catch (err) {
      console.error('Error generating filename:', err);
      cb(err);
    }
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

//gen code eiei
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

router.post('/add', authenticateToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ message: err.message || 'Upload error' });
    }

    const {
      recipientRoomNo,
      recipientName,
      recipientID,
      trackingNo,
      dormID
    } = req.body;

    const userID = req.user.id;
    console.log('File:', req.file);
    console.log('Body:', req.body);

    try {
      const userRole = await getRole(userID, dormID);
      if (!userRole || !['owner', 'package_manager'].includes(userRole.role)) {
        console.log("PERM DENY");
        return res.status(403).json({ message: 'Permission denied' });
      }

      const pathToPicture = req.file ? `/packages/${req.file.filename}` : '';
      const registerTime = getThaiTimeString();

      const queryPromise = (sql, params) => new Promise((resolve, reject) => {
        database.query(sql, params, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

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

      await queryPromise(insertQuery, values);

      // ดึงอีเมลผู้รับ
      const userResults = await queryPromise(`SELECT email FROM user WHERE id = ? LIMIT 1`, [recipientID]);
      const userRow = userResults[0];
      if (!userRow?.email) {
        console.log('ไม่พบอีเมลของผู้รับ');
        return res.json({ message: 'เพิ่มพัสดุแล้ว (ไม่พบอีเมล)' });
      }

      // ดึงชื่อหอพัก
      const dormResults = await queryPromise(`SELECT name FROM dormitory WHERE id = ? LIMIT 1`, [dormID]);
      const dormRow = dormResults[0];
      const dormName = dormRow?.name || 'ไม่ทราบชื่อหอพัก';
      if (!dormRow) console.log("ไม่ทราบหอพัก");

      // นับพัสดุที่รอรับ
      const countResults = await queryPromise(`
        SELECT COUNT(*) AS count
        FROM package
        WHERE recipientID = ? AND dormID = ? AND status = 'wait_for_deliver'
      `, [recipientID, dormID]);
      const count = countResults[0]?.count || 0;

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

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  });
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
router.post('/getTenantPackage', authenticateToken, (req, res) => {
  const { dormID, status, search, date } = req.body;
  const searchText = `%${search || ''}%`;
  const userID = req.user.id;

  let query = `
      SELECT * FROM package
      WHERE dormID = ? AND status = ? AND recipientID = ? AND trackingNo LIKE ?
      
    `;

  const params = [dormID, status, userID, searchText];
  const timeField = status === 'delivered' ? 'deliverTime' : 'registerTime';

  if (date) {
    query += ` AND DATE(${timeField}) = ? ORDER BY ${timeField}`;
    params.push(date); // 'YYYY-MM-DD'
  }

  database.query(query, params, (err, results) => {
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
        SELECT package.*, dorm.name AS dormName, dorm.isActive
        FROM package
        LEFT JOIN dormitory dorm ON package.dormID = dorm.id
        WHERE recipientID = ? AND package.status = 'wait_for_deliver' AND dorm.isActive = 1
        ORDER BY dormName
    `;
  database.query(query, [userID], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

//my package
router.post('/mypackage', authenticateToken, (req, res) => {
  const { status, search, dormID, date, limit, offset } = req.body;
  const searchText = `%${search || ''}%`;
  const userID = req.user.id;

  let query = `
        SELECT pkg.*, dorm.name AS dormName, dorm.isActive
        FROM package pkg
        LEFT JOIN dormitory dorm ON pkg.dormID = dorm.id
        WHERE pkg.recipientID = ? AND pkg.status = ? AND dorm.isActive = 1
        AND (
          pkg.trackingNo LIKE ?
        )
    `;

  const params = [userID, status, searchText];
  const timeField = status === 'delivered' ? 'deliverTime' : 'registerTime';

  if (dormID) {
    query += ` AND pkg.dormID = ?`;
    params.push(dormID);
  }

  if (date) {
    query += ` AND DATE(${timeField}) = ?`;
    params.push(date); // 'YYYY-MM-DD'
  }

  query += ` ORDER BY ${timeField}, pkg.id DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit, 10));
  params.push(parseInt(offset, 10));

  database.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    console.log(results)
    res.json(results);
  });
});


router.post('/getByID', (req, res) => {
  const { id } = req.body;
  const query = `
        SELECT p.*, d.name AS dormName
        FROM package p
        LEFT JOIN dormitory d ON p.dormID = d.id
        WHERE p.id = ?
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


//give package
//fetch ไปแสดง
router.post('/fetchToDeliver', authenticateToken, (req, res) => {
  const { recipientID, dormID } = req.body;

  let query = ''

  query = `
    SELECT * FROM package
    WHERE recipientID = ? AND dormID = ? AND status = 'wait_for_deliver'
    ORDER BY registerTime DESC
  `;

  database.query(query, [recipientID, dormID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
    res.json(results);
    console.log(results)
  });
});

//deliver
router.post('/deliverPackage', authenticateToken, async (req, res) => {
  const { selectedPackage, receiver, dormID, email } = req.body;

  const userID = req.user.id;
  const deliverTime = getThaiTimeString();

  if (!Array.isArray(selectedPackage) || selectedPackage.length === 0) {
    return res.status(400).json({ message: 'ไม่มีพัสดุที่เลือก' });
  }

  const userRole = await getRole(userID, dormID);
  if (!userRole || !['owner', 'package_manager'].includes(userRole.role)) {
    return res.status(403).json({ message: 'Permission denied' });
  }

  const deliverBy = userRole.fullName;

  try {
    const updateQuery = `
      UPDATE package
      SET status = 'delivered',
          deliverBy = ?,
          deliverTime = ?,
          receiver = ?
      WHERE id IN (?)
    `;

    database.query(updateQuery, [deliverBy, deliverTime, receiver, selectedPackage], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
      }

      console.log(receiver);
      if (!email || email.trim() === "" || receiver === "ผู้ใช้ที่ไม่อยู่ในระบบ") {
        console.log("CANT SEND EMAIL");
        return res.status(200).json({ message: 'สำเร็จ' });
      }

      // ดึง trackingNo 
      database.query('SELECT trackingNo FROM package WHERE id IN (?)', [selectedPackage], async (err2, rows) => {
        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพัสดุ' });
        }

        const trackingList = rows.map(row => row.trackingNo).join('<br>');

        // ดึงชื่อหอพัก
        database.query('SELECT name FROM dormitory WHERE id = ?', [dormID], (err3, dormRows) => {
          const dormName = dormRows?.[0]?.name || 'ไม่ทราบชื่อหอพัก';

          const mailOptions = {
            from: `"Dormitory Admin" <test@gmail.com>`,
            to: email,
            subject: 'พัสดุของคุณถูกนำจ่ายแล้ว',
            html: `
                  <p>เรียนคุณ <strong>${receiver}</strong>,</p>
                  <p>พัสดุจำนวน <strong>${selectedPackage.length} ชิ้น</strong> ของคุณได้ถูกนำจ่ายเรียบร้อยแล้วโดยเจ้าหน้าที่ <strong>${deliverBy}</strong></p>
                  <p><strong>หอพัก:</strong> ${dormName}</p>
                  <p><strong>รายการหมายเลขพัสดุ:</strong><br>${trackingList}</p>
                  <p>ขอบคุณครับ</p>
                `
          };

          sendEmail(mailOptions);
          console.log(`📧 Email sent to ${email}`);

          res.json({ message: 'นำจ่ายสำเร็จและส่งอีเมลแล้ว', result: results });
        }
        );
      }
      );
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดต' });
  }
});

// DELETE package by ID
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM package WHERE id = ?';

  database.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting package:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({ message: 'Package deleted successfully' });
  });
});







module.exports = router;

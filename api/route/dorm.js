const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const database = require('../database');
const authenticateToken = require('../middlewares/authenticateToken');
const fs = require('fs');


// ตั้งค่า storage ของ multer เพื่อบันทึกไฟล์ที่อัปโหลด
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + generateCode() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

//gen code eiei
function generateCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

//for dorm
async function generateUniqueInviteCode() {
    let code;
    let exists = true;

    while (exists) {
        code = generateCode(10);
        const [rows] = await new Promise((resolve, reject) => {
            database.query('SELECT id FROM dormitory WHERE inviteCode = ?', [code], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve([results]);
                }
            });
        });

        if (rows.length === 0) {
            exists = false;
        }
        console.log("CHECK DORM CODE EXISTS: ", exists)
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


router.post('/create', authenticateToken, upload.single('picture'), async (req, res) => {
    const { name, address, ownerName, phoneNo } = req.body;


    if (!name || !address || !ownerName || !phoneNo) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    let pictureUrl = '';
    if (req.file) {
        pictureUrl = `/uploads/${req.file.filename}`;
        console.log('found img')
    } else {
        console.log('not found img')
    }

    const inviteCode = await generateUniqueInviteCode();

    const insertQuery = `
    INSERT INTO dormitory (name, address, ownerName, phoneNo, pathToPicture, inviteCode, isActive)
    VALUES (?, ?, ?, ?, ?, ?, true)
  `;

    database.query(insertQuery, [name, address, ownerName, phoneNo, pictureUrl, inviteCode], async (err, result) => {
        if (err) {
            console.error('Error inserting dorm:', err);
            return res.status(500).json({ message: 'Failed to save dorm' });
        }

        const dormId = result.insertId;
        const insertUserDormQuery = `
        INSERT INTO user_dorm (fullName, role, roomID, userID, dormID, code)
        VALUES (?, ?, ?, ?, ?, ?)`;

        const userCode = await generateUniqueUserCode();
        const mockData = [ownerName, 'owner', 0, req.user.id, dormId, userCode];

        database.query(insertUserDormQuery, mockData, (err2, result2) => {
            if (err2) {
                console.error('Error inserting user_dorm:', err2);
                return res.status(500).json({ message: 'Dorm created but failed to link user_dorm' });
            }

            res.json({
                message: 'Dorm and user_dorm created successfully',
                dormId: dormId,
                userDormId: result2.insertId
            });
        });
    }
    );
});

router.get('/info/:id', authenticateToken, (req, res) => {
    const dormId = req.params.id;
    console.log(dormId)

    const query = 'SELECT * FROM dormitory WHERE id = ?';
    database.query(query, [dormId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving dormitory data' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Dormitory not found' });
        }
        console.log(result[0])

        res.json(result[0]);
    });
});

router.get('/check-invite/:inviteCode', (req, res) => {
    const { inviteCode } = req.params;

    const query = 'SELECT id FROM dormitory WHERE inviteCode = ?';
    database.query(query, [inviteCode], (err, results) => {
        if (err) {
            console.error('Error checking invite code:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.json({ exists: false });
        }

        return res.json({ exists: true, dormId: results[0].id });
    });
});

router.get('/info-by-code/:code', (req, res) => {
    const code = req.params.code;

    const query = 'SELECT name FROM dormitory WHERE inviteCode = ? LIMIT 1';
    database.query(query, [code], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (result.length === 0) return res.status(404).json({ message: 'Dorm not found' });

        res.json({ name: result[0].name });
    });
});


// router.put('/update/:id', (req, res) => {
//     const { id } = req.params;
//     const { name, address, ownerName, phoneNo } = req.body;

//     const query = `
//     UPDATE dormitory
//     SET name = ?, address = ?, ownerName = ?, phoneNo = ?
//     WHERE id = ?
//   `;

//     database.query(query, [name, address, ownerName, phoneNo, id], (err, result) => {
//         if (err) return res.status(500).json({ message: 'Database error' });

//         res.json({ message: 'Dorm updated successfully' });
//     });
// });

router.put('/update/:id', upload.single('picture'), (req, res) => {
    const { id } = req.params;
    const { name, address, ownerName, phoneNo, oldPath, deleteImage } = req.body;

    let newPath = oldPath;

    //มีไฟล์ = อัปรูปใหม่
    if (req.file) {
        console.log("HAVE NEW PIC")
        newPath = `/uploads/${req.file.filename}`;
        // ลบรูปเก่า
        if (oldPath) {
            const fullPath = path.join(__dirname, '..', oldPath);
            fs.unlink(fullPath, (err) => {
                if (err) console.error('Error deleting old image:', err);
            });
            console.log("DELETE OLD PATH , UPDATE NEW PATH")
        }
    } else if (deleteImage === 'true') {
        console.log("WANT TO DEL PIC")
        if (oldPath) {
            const fullPath = path.join(__dirname, '..', oldPath);
            fs.unlink(fullPath, (err) => {
                if (err) console.error('Error deleting image:', err);
            });
            console.log("DEL PIC")
        }
        newPath = ''; // ล้างรูป
    }

    const query = `
    UPDATE dormitory
    SET name = ?, address = ?, ownerName = ?, phoneNo = ?, pathToPicture = ?
    WHERE id = ?
  `;
    database.query(query, [name, address, ownerName, phoneNo, newPath, id], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Dorm updated successfully' });
    });
});

router.put('/deactivate/:id', (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE dormitory SET isActive = 0 WHERE id = ?';

  database.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deactivating dormitory:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.json({ message: 'Dormitory deactivated successfully' });
  });
});





module.exports = router;

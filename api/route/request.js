const express = require('express');
const router = express.Router();
const database = require('../database');


router.post('/join', (req, res) => {
    const { userID, fullName, code } = req.body;

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
        const insertQuery = `
            INSERT INTO request (userID, fullName, date, status, dormID)
            VALUES (?, ?, NOW(), 'not accept', ?)`;

        database.query(insertQuery, [userID, fullName, dormID], (err2, result2) => {
            if (err2) {
                console.error(err2);
                return res.status(500).json({ message: 'Failed to save request' });
            }

            res.json({ message: 'Request submitted' });
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

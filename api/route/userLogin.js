const express = require('express');
const router = express.Router();
const database = require('../database'); 

//json web token
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authenticateToken');
const SECRET_KEY = process.env.JWT_SECRET;

// bcrypt
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;


router.get('/users', (req, res) => {
  const query = 'SELECT * FROM user'; 

  database.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Error fetching users' });
      return;
    }
    res.json(results);  
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT id, username, password FROM user WHERE username = ?';

  database.query(query, [username, password], async (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
        expiresIn: '60m',
      });

      res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });

    } catch (compareErr) {
      console.error('Error comparing passwords:', compareErr);
      res.status(500).json({ message: 'Error verifying credentials' });
    }
  });
});

router.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const query = 'SELECT * FROM user WHERE username = ? OR email = ?';

  database.query( query, [username, email] , async (err, results) => {
    if(err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Internal server error' });
      return;
    }
    // มีบางคนใช้ username หรือ email นั้นแล้ว แปลว่า query record เจอ
    if(results.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const insertQuery = 'INSERT INTO user (username, password, email) VALUES (?, ?, ?)';
      database.query(insertQuery, [username, hashedPassword, email], (err, result) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).json({ message: 'Failed to register user' });
        }

        res.json({ message: 'User registered successfully' });
      });
    } catch (hashErr) {
      console.error('Error hashing password:', hashErr);
      res.status(500).json({ message: 'Error hashing password' });
    }

  })

});

//Check Token
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user }); 
});

module.exports = router;

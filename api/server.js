// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const path = require('path');

// Middleware
app.use(express.json());
app.use(cors());

//.env
require('dotenv').config();


//import fetch
const userLogin = require('./route/userLogin');
const dorm = require('./route/dorm');
const package = require('./route/package');
const request = require('./route/request');
const dormRoom = require('./route/dormRoom');
const dormUser = require('./route/dormUser');
const email = require('./route/email');

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/api', (req, res) => {
  res.json({ message: 'This is a backend API endpoint' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/packages', express.static(path.join(__dirname, 'packages')));

app.use('/user', userLogin);
app.use('/dorm', dorm);
app.use('/package', package);
app.use('/request', request);
app.use('/dorm-room', dormRoom);
app.use('/dorm-user', dormUser);
app.use('/email', email);


//Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
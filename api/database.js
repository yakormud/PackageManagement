// db.js
const mysql = require('mysql2');

// Create and export the database connection
const connection = mysql.createConnection({
  host: 'localhost',       // The host (XAMPP default is localhost)
  user: 'root',            // Your MySQL username (XAMPP default is root)
  password: '',            // Your MySQL password (XAMPP default is empty)
  database: 'myproject'  // The name of your database
});

// Test the connection
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

module.exports = connection;  // Export the connection to be used in other files

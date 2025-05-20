const database = require('../database');

async function getRole(userID, dormID) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT role, fullName FROM user_dorm
      WHERE userID = ? AND dormID = ?
      LIMIT 1
    `;
    database.query(sql, [userID, dormID], (err, results) => {
      if (err) return reject(err);
      if (results.length === 0) return resolve(null);
      resolve(results[0]); //{ role: 'owner', fullName: 'นายเอ บางคน' }
    });
  });
}

module.exports = getRole;
process.env.HOST

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  password: process.env.PASSWORD || '',
  database: process.env.DATABASE || 'database',
  multipleStatements: true
});

module.exports = {
  query: function (sql, values, callback) {
    return connection.query(sql, values, callback);
  }
};
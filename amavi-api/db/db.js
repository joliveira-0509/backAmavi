const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '200.129.130.149',
  user: 'amavi',
  password: '12345678',
  database: 'amavi_db',
  port: 20002 
});

module.exports = connection;

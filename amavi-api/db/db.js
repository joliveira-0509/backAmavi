const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'amavi',
  password: 'Mnb2711@',
  database: 'amavi_bd',
  port: 3306 
});

module.exports = connection;

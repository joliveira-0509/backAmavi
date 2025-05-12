const mysql = require('mysql2/promise'); 

const connection = mysql.createPool({ 
  host: '200.129.130.149',
  user: 'amavi',
  password: '12345678',
  database: 'amavi_bd',
  port:20002
});

module.exports = connection;

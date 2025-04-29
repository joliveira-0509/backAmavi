const db = require('../db/db');

exports.login = (req, res) => {
  const { cpf, senha } = req.body;
  const sql = 'SELECT * FROM Login WHERE cpf = ? AND senha = ?';
  db.query(sql, [cpf, senha], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'CPF ou senha inválidos' });
    res.json({ message: 'Login bem-sucedido', usuario: results[0] });
  });
};

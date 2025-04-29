const db = require('../db/db');

// Buscar todos os usuários
exports.getUsuarios = (req, res) => {
  db.query('SELECT * FROM Usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Criar um novo usuário
exports.createUsuario = (req, res) => {
  const {
    nome,
    cpf,
    rg,
    endereco,
    email,
    num_sus,
    tipo_usuario,
    id_responsavel,
    foto_url
  } = req.body;

  const sql = `
    INSERT INTO Usuarios (nome, cpf, rg, endereco, email, num_sus, tipo_usuario, id_responsavel, foto_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    nome,
    cpf,
    rg,
    endereco,
    email,
    num_sus,
    tipo_usuario,
    id_responsavel,
    foto_url
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Usuário criado com sucesso!', id: result.insertId });
  });
};

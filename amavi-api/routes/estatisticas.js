const express = require('express');
const router = express.Router();
const db = require('../db/db');

// Registrar acesso
router.post('/registrar-acesso', async (req, res) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'desconhecido';
  try {
    await db.execute(`INSERT INTO Acessos (ip) VALUES (?)`, [ip]);
    res.status(200).json({ message: 'Acesso registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar acesso:', err);
    res.status(500).json({ error: 'Erro ao registrar acesso' });
  }
});

// Retornar acessos mensais
router.get('/acessos-mensais', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        MONTH(data_acesso) AS mes,
        COUNT(*) AS total
      FROM Acessos
      GROUP BY mes
      ORDER BY mes
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar acessos' });
  }
});

module.exports = router;
import pool from '../database/db.js';

export const cadastrarEvento = async (req, res) => {
  const { titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO AgendaEvento (titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url]
    );
    res.status(201).json({ message: 'Evento cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('Erro ao cadastrar evento:', error);
    res.status(500).json({ error: 'Erro ao cadastrar evento' });
  }
};

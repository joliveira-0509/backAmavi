import pool from '../database/db.js';

export const cadastrarRequerimento = async (req, res) => {
  const { id_beneficiario, id_documentacao, descricao } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO SolicitacaoAtendimento (id_beneficiario, id_documentacao, descricao) VALUES (?, ?, ?)',
      [id_beneficiario, id_documentacao, descricao]
    );
    res.status(201).json({ message: 'Requerimento cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('Erro ao cadastrar requerimento:', error);
    res.status(500).json({ error: 'Erro ao cadastrar requerimento' });
  }
};

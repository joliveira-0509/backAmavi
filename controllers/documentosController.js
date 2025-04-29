import pool from '../database/db.js';

export const cadastrarDocumento = async (req, res) => {
  const { id_paciente, inscricao } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Documentacao (id_paciente, inscricao) VALUES (?, ?)',
      [id_paciente, inscricao]
    );
    res.status(201).json({ message: 'Documento cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    console.error('Erro ao cadastrar documento:', error);
    res.status(500).json({ error: 'Erro ao cadastrar documento' });
  }
};

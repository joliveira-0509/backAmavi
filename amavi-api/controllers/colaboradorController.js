const db = require('../db/db'); // Arquivo de configuração de banco de dados

// Listar todos os colaboradores
const listarColaboradores = async (req, res) => {
  try {
    const sql = 'SELECT * FROM Colaborador';
    const [rows] = await db.execute(sql);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar colaboradores.', detalhes: error.message });
  }
};

// Buscar colaborador por ID
const buscarColaboradorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM Colaborador WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar colaborador.', detalhes: error.message });
  }
};

// Cadastrar novo colaborador
const cadastrarColaborador = async (req, res) => {
  try {
    const { nome, cargo, email, telefone, foto_url } = req.body;

    if (!nome || !cargo) {
      return res.status(400).json({ erro: 'Nome e cargo são obrigatórios.' });
    }

    const sql = 'INSERT INTO Colaborador (nome, cargo, email, telefone, foto_url) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.execute(sql, [nome, cargo, email, telefone, foto_url]);
    res.status(201).json({ mensagem: 'Colaborador cadastrado com sucesso!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar colaborador.', detalhes: error.message });
  }
};

// Atualizar colaborador
const atualizarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, email, telefone, foto_url } = req.body;

    const sql = 'SELECT * FROM Colaborador WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    const updateSql = 'UPDATE Colaborador SET nome = ?, cargo = ?, email = ?, telefone = ?, foto_url = ? WHERE id = ?';
    await db.execute(updateSql, [nome, cargo, email, telefone, foto_url, id]);

    res.status(200).json({ mensagem: 'Colaborador atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar colaborador.', detalhes: error.message });
  }
};

// Atualização parcial (PATCH)
const editarParcialColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const sql = 'SELECT * FROM Colaborador WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    const updateSql = 'UPDATE Colaborador SET ? WHERE id = ?';
    await db.execute(updateSql, [dados, id]);

    res.status(200).json({ mensagem: 'Colaborador atualizado parcialmente com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar colaborador.', detalhes: error.message });
  }
};

// Deletar colaborador
const deletarColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'SELECT * FROM Colaborador WHERE id = ?';
    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    const deleteSql = 'DELETE FROM Colaborador WHERE id = ?';
    await db.execute(deleteSql, [id]);

    res.status(200).json({ mensagem: 'Colaborador excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir colaborador.', detalhes: error.message });
  }
};

module.exports = {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador,
};

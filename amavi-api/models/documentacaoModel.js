const db = require('../db/db');

const DocumentacaoModel = {
  // Cadastrar nova documentação
  async cadastrar(id_usuario, descricao, arquivoBuffer) {
    const sql = `
      INSERT INTO Documentacao (id_usuario, descricao, arquivo_url)
      VALUES (?, ?, ?)
    `;
    try {
      const [result] = await db.execute(sql, [id_usuario, descricao, arquivoBuffer]);
      console.log('Inserção bem-sucedida, ID:', result.insertId);
      return result.insertId;
    } catch (err) {
      console.error('Erro na query SQL (cadastrar):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Listar todas as documentações (sem arquivo para performance)
  async listarTodas() {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em
      FROM Documentacao
    `;
    try {
      const [rows] = await db.execute(sql);
      return rows;
    } catch (err) {
      console.error('Erro na query SQL (listarTodas):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Buscar uma documentação por ID (sem arquivo)
  async buscarPorId(id) {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em
      FROM Documentacao
      WHERE id = ?
    `;
    try {
      const [rows] = await db.execute(sql, [id]);
      return rows[0] || null;
    } catch (err) {
      console.error('Erro na query SQL (buscarPorId):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Buscar arquivo binário por ID
  async buscarDocumentoPorId(id) {
    const sql = `SELECT arquivo_url FROM Documentacao WHERE id = ?`;
    try {
      const [rows] = await db.execute(sql, [id]);
      return rows[0]?.arquivo_url || null;
    } catch (err) {
      console.error('Erro na query SQL (buscarDocumentoPorId):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Buscar documentações por usuário
  async buscarPorUsuario(id_usuario) {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em
      FROM Documentacao
      WHERE id_usuario = ?
    `;
    try {
      const [rows] = await db.execute(sql, [id_usuario]);
      return rows;
    } catch (err) {
      console.error('Erro na query SQL (buscarPorUsuario):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Atualizar documentação
  async atualizar(id, id_usuario, descricao, arquivoBuffer) {
    const sql = `
      UPDATE Documentacao
      SET id_usuario = ?, descricao = ?, arquivo_url = COALESCE(?, arquivo_url)
      WHERE id = ?
    `;
    try {
      await db.execute(sql, [id_usuario, descricao, arquivoBuffer, id]);
    } catch (err) {
      console.error('Erro na query SQL (atualizar):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Atualização parcial (sem arquivo)
  async atualizarParcial(id, dados) {
    const campos = Object.keys(dados);
    const valores = Object.values(dados);

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar.');
    }

    const setString = campos.map(campo => `${campo} = ?`).join(', ');
    const sql = `UPDATE Documentacao SET ${setString} WHERE id = ?`;
    try {
      await db.execute(sql, [...valores, id]);
    } catch (err) {
      console.error('Erro na query SQL (atualizarParcial):', err.message, err.sqlMessage);
      throw err;
    }
  },

  // Deletar documentação
  async deletar(id) {
    const sql = `DELETE FROM Documentacao WHERE id = ?`;
    try {
      await db.execute(sql, [id]);
    } catch (err) {
      console.error('Erro na query SQL (deletar):', err.message, err.sqlMessage);
      throw err;
    }
  }
};

module.exports = DocumentacaoModel;
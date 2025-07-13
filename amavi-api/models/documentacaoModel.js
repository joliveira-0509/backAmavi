const db = require('../db/db');

const DocumentacaoModel = {
  async cadastrar(id_usuario, descricao, arquivoBuffer) {
    const sql = `
      INSERT INTO Documentacao (id_usuario, descricao, arquivo_url)
      VALUES (?, ?, ?)
    `;
    try {
      const [result] = await db.execute(sql, [id_usuario, descricao, arquivoBuffer]);
      return result.insertId;
    } catch (err) {
      console.error('Erro na query SQL (cadastrar):', err.message);
      throw err;
    }
  },

  async listarTodas() {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em
      FROM Documentacao
      ORDER BY criado_em DESC
    `;
    try {
      const [rows] = await db.execute(sql);
      return rows;
    } catch (err) {
      console.error('Erro na query SQL (listarTodas):', err.message);
      throw err;
    }
  },

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
      console.error('Erro na query SQL (buscarPorId):', err.message);
      throw err;
    }
  },

  async buscarDocumentoPorId(id) {
    const sql = `SELECT arquivo_url FROM Documentacao WHERE id = ?`;
    try {
      const [rows] = await db.execute(sql, [id]);
      return rows[0]?.arquivo_url || null;
    } catch (err) {
      console.error('Erro na query SQL (buscarDocumentoPorId):', err.message);
      throw err;
    }
  },

  async buscarPorUsuario(id_usuario) {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em
      FROM Documentacao
      WHERE id_usuario = ?
      ORDER BY criado_em DESC
    `;
    try {
      const [rows] = await db.execute(sql, [id_usuario]);
      return rows;
    } catch (err) {
      console.error('Erro na query SQL (buscarPorUsuario):', err.message);
      throw err;
    }
  },

  async atualizar(id, id_usuario, descricao, arquivoBuffer) {
    const sql = `
      UPDATE Documentacao
      SET id_usuario = ?, descricao = ?, arquivo_url = COALESCE(?, arquivo_url)
      WHERE id = ?
    `;
    try {
      await db.execute(sql, [id_usuario, descricao, arquivoBuffer, id]);
    } catch (err) {
      console.error('Erro na query SQL (atualizar):', err.message);
      throw err;
    }
  },

  async deletar(id) {
    const sql = `DELETE FROM Documentacao WHERE id = ?`;
    try {
      await db.execute(sql, [id]);
    } catch (err) {
      console.error('Erro na query SQL (deletar):', err.message);
      throw err;
    }
  }
};

module.exports = DocumentacaoModel;

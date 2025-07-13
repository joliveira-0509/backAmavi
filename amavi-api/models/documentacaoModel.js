const db = require('../db/db');

const DocumentacaoModel = {
  // Cadastrar nova documentação (arquivo como buffer)
  async cadastrar(id_usuario, descricao, arquivoBuffer) {
    const sql = `
      INSERT INTO Documentacao (id_usuario, descricao, arquivo_url) 
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(sql, [id_usuario, descricao, arquivoBuffer]);
    return result.insertId;
  },

  // Buscar todas as documentações (sem o arquivo para performance)
  async listarTodas() {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em 
      FROM Documentacao
    `;
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Buscar uma documentação (sem o arquivo)
  async buscarPorId(id) {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em 
      FROM Documentacao 
      WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  // Buscar arquivo binário por ID
  async buscarDocumentoPorId(id) {
    const sql = `SELECT arquivo_url FROM Documentacao WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0]?.arquivo_url || null; // Isso será um Buffer
  },

  // Buscar documentações por usuário
  async buscarPorUsuario(id_usuario) {
    const sql = `
      SELECT id, id_usuario, descricao, criado_em 
      FROM Documentacao 
      WHERE id_usuario = ?
    `;
    const [rows] = await db.execute(sql, [id_usuario]);
    return rows;
  },

  // Atualizar documentação com novo arquivo
  async atualizar(id, id_usuario, descricao, arquivoBuffer) {
    const sql = `
      UPDATE Documentacao 
      SET id_usuario = ?, descricao = ?, arquivo_url = ? 
      WHERE id = ?
    `;
    await db.execute(sql, [id_usuario, descricao, arquivoBuffer, id]);
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
    await db.execute(sql, [...valores, id]);
  },

  // Deletar documentação
  async deletar(id) {
    const sql = `DELETE FROM Documentacao WHERE id = ?`;
    await db.execute(sql, [id]);
  }
};

module.exports = DocumentacaoModel;

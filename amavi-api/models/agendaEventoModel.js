const db = require('../db/db');
//oi
const AgendaEventoModel = {
  // Cadastrar novo evento
  async cadastrar(titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url) {
    const sql = `
      INSERT INTO AgendaEvento (
        titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      titulo,
      descricao,
      tipo_evento,
      data_evento,
      horario_evento,
      publico,
      foto_url
    ]);
    return result.insertId;
  },

  // Buscar todos os eventos
  async listarTodos() {
    const sql = `SELECT id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico FROM AgendaEvento`; // Exclui foto_url para performance
    const [rows] = await db.execute(sql);
    return rows;
  },

  // Buscar eventos por tipo
  async listarPorTipo(tipo_evento) {
    const sql = `SELECT id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico FROM AgendaEvento WHERE tipo_evento = ?`;
    const [rows] = await db.execute(sql, [tipo_evento]);
    return rows;
  },

  // Buscar evento por ID
  async buscarPorId(id) {
    const sql = `SELECT id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico FROM AgendaEvento WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  },

  // Buscar foto_url por ID
  async buscarImagemPorId(id) {
    const sql = `SELECT foto_url FROM AgendaEvento WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    return rows[0]?.foto_url || null;
  },

  // Atualizar evento (completo)
  async atualizar(id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url) {
    const sql = `
      UPDATE AgendaEvento SET
        titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?, horario_evento = ?, publico = ?, foto_url = ?
      WHERE id = ?
    `;
    await db.execute(sql, [
      titulo,
      descricao,
      tipo_evento,
      data_evento,
      horario_evento,
      publico,
      foto_url,
      id
    ]);
  },

  // Atualização parcial do evento
  async atualizarParcial(id, dados) {
    const campos = Object.keys(dados);
    const valores = Object.values(dados);

    if (campos.length === 0) {
      throw new Error('Nenhum campo para atualizar.');
    }

    const setString = campos.map(campo => `${campo} = ?`).join(', ');
    const sql = `UPDATE AgendaEvento SET ${setString} WHERE id = ?`;
    await db.execute(sql, [...valores, id]);
  },

  // Deletar evento
  async deletar(id) {
    const sql = `DELETE FROM AgendaEvento WHERE id = ?`;
    await db.execute(sql, [id]);
  }
};

module.exports = AgendaEventoModel;
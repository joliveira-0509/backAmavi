const db = require('../db/db');

const AgendaEventoModel = {
  cadastrar: async (evento) => {
    const sql = `
      INSERT INTO AgendaEvento (
        titulo, descricao, tipo_evento, data_evento,
        horario_evento, publico, foto_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.execute(sql, [
      evento.titulo,
      evento.descricao,
      evento.tipo_evento,
      evento.data_evento,
      evento.horario_evento,
      evento.publico,
      evento.foto_url
    ]);
    return result;
  },

  listarTodos: async () => {
    const [rows] = await db.execute('SELECT * FROM AgendaEvento');
    return rows;
  },

  listarPorTipo: async (tipo_evento) => {
    const [rows] = await db.execute('SELECT * FROM AgendaEvento WHERE tipo_evento = ?', [tipo_evento]);
    return rows;
  },

  editar: async (id, evento) => {
    const sql = `
      UPDATE AgendaEvento SET
        titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?,
        horario_evento = ?, publico = ?, foto_url = ?
      WHERE id = ?
    `;
    await db.execute(sql, [
      evento.titulo,
      evento.descricao,
      evento.tipo_evento,
      evento.data_evento,
      evento.horario_evento,
      evento.publico,
      evento.foto_url,
      id
    ]);
  },

  deletar: async (id) => {
    await db.execute('DELETE FROM AgendaEvento WHERE id = ?', [id]);
  }
};

module.exports = AgendaEventoModel;

const db = require('../db/db');

const AgendaEventoModel = {
  listarTodos: async () => {
    const [result] = await db.execute('SELECT * FROM AgendaEvento');
    return result;
  },

  listarPorTipo: async (tipo) => {
    const [result] = await db.execute('SELECT * FROM AgendaEvento WHERE tipo_evento = ?', [tipo]);
    return result;
  },

  buscarPorId: async (id) => {
    const [result] = await db.execute('SELECT * FROM AgendaEvento WHERE id = ?', [id]);
    return result[0];
  },

  buscarImagemPorId: async (id) => {
    const [result] = await db.execute('SELECT foto_url FROM AgendaEvento WHERE id = ?', [id]);
    return result[0]?.foto_url || null;
  },

  cadastrar: async (titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url) => {
    const sql = `
      INSERT INTO AgendaEvento (titulo, descricao, tipo_evento, data_evento, horario_evento, publico, criado_em, foto_url)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
    const [result] = await db.execute(sql, [titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url]);
    return result.insertId;
  },

  atualizar: async (id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url) => {
    const sql = `
      UPDATE AgendaEvento SET
        titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?,
        horario_evento = ?, publico = ?, foto_url = ?
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url, id]);
    return result;
  },

  atualizarParcial: async (id, campos) => {
    let sql = 'UPDATE AgendaEvento SET ';
    const sets = [];
    const valores = [];

    for (const [key, value] of Object.entries(campos)) {
      sets.push(`${key} = ?`);
      valores.push(value);
    }

    sql += sets.join(', ') + ' WHERE id = ?';
    valores.push(id);

    const [result] = await db.execute(sql, valores);
    return result;
  },

  deletar: async (id) => {
    const [result] = await db.execute('DELETE FROM AgendaEvento WHERE id = ?', [id]);
    return result;
  }
};

module.exports = AgendaEventoModel;


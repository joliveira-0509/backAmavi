const db = require('../db/db');

const AgendaEventoModel = {
  cadastrar: async (evento) => {
    try {
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
        evento.foto_url // alterado para foto_url
      ]);
      return result;
    } catch (err) {
      console.error('Erro no model cadastrar:', err);
      throw err;
    }
  },

  listarTodos: async () => {
    try {
      const [rows] = await db.execute('SELECT * FROM AgendaEvento');
      return rows;
    } catch (err) {
      console.error('Erro no model listarTodos:', err);
      throw err;
    }
  },

  listarPorTipo: async (tipo_evento) => {
    try {
      const [rows] = await db.execute('SELECT * FROM AgendaEvento WHERE tipo_evento = ?', [tipo_evento]);
      return rows;
    } catch (err) {
      console.error('Erro no model listarPorTipo:', err);
      throw err;
    }
  },

  buscarPorId: async (id) => {
    try {
      const [rows] = await db.execute('SELECT * FROM AgendaEvento WHERE id = ?', [id]);
      return rows[0]; // Retorna o primeiro resultado ou undefined se não achar
    } catch (err) {
      console.error('Erro no model buscarPorId:', err);
      throw err;
    }
  },

  editar: async (id, evento) => {
    try {
      const sql = `
        UPDATE AgendaEvento SET
          titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?,
          horario_evento = ?, publico = ?
        WHERE id = ?
      `;
      const [result] = await db.execute(sql, [
        evento.titulo,
        evento.descricao,
        evento.tipo_evento,
        evento.data_evento,
        evento.horario_evento,
        evento.publico,
        id
      ]);
      return result; // pode usar result.affectedRows para saber se atualizou
    } catch (err) {
      console.error('Erro no model editar:', err);
      throw err;
    }
  },

  deletar: async (id) => {
    try {
      const [result] = await db.execute('DELETE FROM AgendaEvento WHERE id = ?', [id]);
      return result; // result.affectedRows indica se deletou algo
    } catch (err) {
      console.error('Erro no model deletar:', err);
      throw err;
    }
  }
};

module.exports = AgendaEventoModel;
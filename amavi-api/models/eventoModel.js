const db = require('../db/db');

const Evento = {
  // Criar evento
  create: async (dados) => {
    const sql = `
      INSERT INTO AgendaEvento
      (titulo, descricao, tipo_evento, data_evento, horario_evento, publico, criado_em)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    const valores = [
      dados.titulo,
      dados.descricao,
      dados.tipo_evento,
      dados.data_evento,
      dados.horario_evento,
      dados.publico
    ];

    const [resultado] = await db.execute(sql, valores);
    return resultado;
  },

  // Listar todos eventos
  findAll: async () => {
    const sql = 'SELECT * FROM AgendaEvento';
    const [eventos] = await db.execute(sql);
    return eventos;
  },

  // Buscar evento por ID
  findById: async (id) => {
    const sql = 'SELECT * FROM AgendaEvento WHERE id = ?';
    const [eventos] = await db.execute(sql, [id]);
    return eventos[0];
  },

  // Atualizar evento inteiro
  update: async (id, dados) => {
    const sql = `
      UPDATE AgendaEvento SET
      titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?,
      horario_evento = ?, publico = ?
      WHERE id = ?
    `;
    const valores = [
      dados.titulo,
      dados.descricao,
      dados.tipo_evento,
      dados.data_evento,
      dados.horario_evento,
      dados.publico,
      id
    ];
    const [resultado] = await db.execute(sql, valores);
    return resultado;
  },

  // Atualizar parcialmente (campos dinâmicos)
  updatePartial: async (id, campos) => {
    let sql = 'UPDATE AgendaEvento SET ';
    const sets = [];
    const valores = [];

    for (const [key, value] of Object.entries(campos)) {
      sets.push(`${key} = ?`);
      valores.push(value);
    }

    sql += sets.join(', ');
    sql += ' WHERE id = ?';
    valores.push(id);

    const [resultado] = await db.execute(sql, valores);
    return resultado;
  },

  // Deletar evento
  delete: async (id) => {
    const sql = 'DELETE FROM AgendaEvento WHERE id = ?';
    const [resultado] = await db.execute(sql, [id]);
    return resultado;
  }
};

module.exports = Evento;
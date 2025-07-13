const db = require('../db/db');

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
      foto_url // aqui deve ser Buffer vindo do multer (req.file.buffer)
    ]);
    return result.insertId;
  },

  // Buscar todos os eventos (com foto_url convertida)
  async listarTodos() {
    const sql = `
      SELECT id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url
      FROM AgendaEvento
    `;
    const [rows] = await db.execute(sql);
    return rows.map(evento => ({
      ...evento,
      foto_url: evento.foto_url
        ? `data:image/jpeg;base64,${evento.foto_url.toString('base64')}`
        : null,
    }));
  },

  // Buscar eventos por tipo (com foto_url convertida)
  async listarPorTipo(tipo_evento) {
    const sql = `
      SELECT id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url
      FROM AgendaEvento
      WHERE tipo_evento = ?
    `;
    const [rows] = await db.execute(sql, [tipo_evento]);
    return rows.map(evento => ({
      ...evento,
      foto_url: evento.foto_url
        ? `data:image/jpeg;base64,${evento.foto_url.toString('base64')}`
        : null,
    }));
  },

  // Buscar evento por ID (com foto_url convertida)
  async buscarPorId(id) {
    const sql = `
      SELECT id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url
      FROM AgendaEvento
      WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    if (!rows[0]) return null;

    const evento = rows[0];
    evento.foto_url = evento.foto_url
      ? `data:image/jpeg;base64,${evento.foto_url.toString('base64')}`
      : null;

    return evento;
  },

  // Buscar foto_url por ID (retornando base64)
  async buscarImagemPorId(id) {
    const sql = `SELECT foto_url FROM AgendaEvento WHERE id = ?`;
    const [rows] = await db.execute(sql, [id]);
    if (rows[0]?.foto_url) {
      return `data:image/jpeg;base64,${rows[0].foto_url.toString('base64')}`;
    }
    return null;
  },

  // Atualizar evento completo
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

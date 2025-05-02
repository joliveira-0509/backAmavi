const db = require('../db/db');

const HistoricoAtendimentoModel = {
  buscarPorUsuario: async (id_usuario) => {
    const sql = `
      SELECT 
        sa.id AS solicitacao_id,
        sa.descricao AS solicitacao_descricao,
        sa.classificacao,
        sa.status,
        a.id AS atendimento_id,
        a.data,
        a.pessoa_atendimento,
        a.bp_atendimento,
        a.inscricao,
        a.criado_em
      FROM SolicitacaoAtendimento sa
      LEFT JOIN Atendimento a ON sa.id_usuario = a.id_usuario
      WHERE sa.id_usuario = ?
      ORDER BY sa.id DESC
    `;
    const [rows] = await db.execute(sql, [id_usuario]);
    return rows;
  }
};

module.exports = HistoricoAtendimentoModel;

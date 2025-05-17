const db = require('../db/db');

const HistoricoAtendimentoModel = {
    buscarPorUsuario: async (id_usuario) => {
        const sql = `
            SELECT
                sa.id AS solicitacao_id,
                sa.descricao AS solicitacao_descricao,
                sa.status AS solicitacao_status,
                a.id AS atendimento_id,
                a.data,
                a.pessoa_atendimento,
                a.bp_atendimento,
                a.inscricao,
                a.criado_em,
                a.status AS atendimento_status
            FROM SolicitacaoAtendimento sa
            LEFT JOIN Atendimento a ON sa.id = a.id_documentacao
            WHERE sa.id_usuario = ?
            ORDER BY sa.id DESC
        `;
        const [rows] = await db.execute(sql, [id_usuario]);
        return rows;
    },

    buscarTodos: async () => {
        const sql = `
            SELECT
                id,
                id_usuario,
                id_documentacao,
                inscricao,
                data,
                pessoa_atendimento,
                bp_atendimento,
                criado_em,
                status
            FROM Atendimento
            ORDER BY criado_em DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },

    adicionarAtendimento: async (novoAtendimento) => {
        const { id_usuario, id_documentacao, inscricao, data, pessoa_atendimento, bp_atendimento, status } = novoAtendimento;
        const sql = `
            INSERT INTO Atendimento (id_usuario, id_documentacao, inscricao, data, pessoa_atendimento, bp_atendimento, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [id_usuario, id_documentacao, inscricao, data, pessoa_atendimento, bp_atendimento, status]);
        return result;
    },

    buscarPorId: async (id) => {
        const sql = `
            SELECT
                id,
                id_usuario,
                id_documentacao,
                inscricao,
                data,
                pessoa_atendimento,
                bp_atendimento,
                criado_em,
                status
            FROM Atendimento
            WHERE id = ?
        `;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    },

    atualizarAtendimento: async (id, dadosAtualizados) => {
        const { id_usuario, id_documentacao, inscricao, data, pessoa_atendimento, bp_atendimento, status } = dadosAtualizados;
        const sql = `
            UPDATE Atendimento
            SET
                id_usuario = ?,
                id_documentacao = ?,
                inscricao = ?,
                data = ?,
                pessoa_atendimento = ?,
                bp_atendimento = ?,
                status = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [id_usuario, id_documentacao, inscricao, data, pessoa_atendimento, bp_atendimento, status, id]);
        return result;
    },

    excluirAtendimento: async (id) => {
        const sql = `
            DELETE FROM Atendimento
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [id]);
        return result;
    },

    buscarAtendimentosRealizados: async () => {
        const sql = `
            SELECT
                id,
                id_usuario,
                id_documentacao,
                inscricao,
                data,
                pessoa_atendimento,
                bp_atendimento,
                criado_em,
                status
            FROM Atendimento
            WHERE bp_atendimento IS NOT NULL AND bp_atendimento != '' -- Adapte a sua lógica de "realizado"
            ORDER BY criado_em DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    },
};

module.exports = HistoricoAtendimentoModel;
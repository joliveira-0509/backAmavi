const db = require('../db/db');

const SolicitacaoAtendimentoModel = {
    // Cadastrar uma nova solicitação
    cadastrar: async (dados) => {
        const sql = `
            INSERT INTO SolicitacaoAtendimento (
                id_usuario, descricao, classificacao, id_documentacao
            ) VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            dados.id_usuario,
            dados.descricao,
            dados.classificacao,
            dados.id_documentacao || null // aceita null se não enviado
        ]);
        return result.insertId;
    },

    // Listar todas as solicitações
    listarTodas: async () => {
        const [rows] = await db.execute('SELECT * FROM SolicitacaoAtendimento');
        return rows;
    },

    // Buscar solicitação por ID
    buscarPorId: async (id) => {
        const [rows] = await db.execute('SELECT * FROM SolicitacaoAtendimento WHERE id = ?', [id]);
        return rows[0];
    },

    // Buscar todas as solicitações de um usuário
    buscarPorUsuario: async (id_usuario) => {
        const [rows] = await db.execute('SELECT * FROM SolicitacaoAtendimento WHERE id_usuario = ?', [id_usuario]);
        return rows;
    },

    // Editar parcialmente uma solicitação
    editar: async (id, dados) => {
        const campos = [];
        const valores = [];

        if (dados.descricao !== undefined) {
            campos.push('descricao = ?');
            valores.push(dados.descricao);
        }

        if (dados.classificacao !== undefined) {
            campos.push('classificacao = ?');
            valores.push(dados.classificacao);
        }

        if (dados.status !== undefined) {
            campos.push('status = ?');
            valores.push(dados.status);
        }

        if (campos.length === 0) {
            throw new Error('Nenhum campo válido fornecido para atualização.');
        }

        const sql = `
            UPDATE SolicitacaoAtendimento
            SET ${campos.join(', ')}
            WHERE id = ?
        `;
        valores.push(id);

        await db.execute(sql, valores);
    },

    // Deletar solicitação
    deletar: async (id) => {
        await db.execute('DELETE FROM SolicitacaoAtendimento WHERE id = ?', [id]);
    }
};

module.exports = SolicitacaoAtendimentoModel;
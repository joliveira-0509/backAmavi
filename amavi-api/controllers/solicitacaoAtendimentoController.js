const SolicitacaoAtendimentoModel = require('../models/solicitacaoAtendimentoModel');

const SolicitacaoAtendimentoController = {
    cadastrar: async (req, res) => {
        try {
            const { id_usuario, descricao, classificacao, id_documentacao } = req.body;

            if (!id_usuario || !descricao || !classificacao) {
                return res.status(400).json({ error: 'Campos obrigatórios: id_usuario, descricao, classificacao.' });
            }

            const id = await SolicitacaoAtendimentoModel.cadastrar({
                id_usuario,
                descricao,
                classificacao,
                id_documentacao
            });

            res.status(201).json({ message: 'Solicitação cadastrada com sucesso!', id });
        } catch (err) {
            console.error('Erro ao cadastrar solicitação:', err);
            res.status(500).json({ error: 'Erro ao cadastrar solicitação.', details: err.message });
        }
    },

    listarTodas: async (req, res) => {
        try {
            const resultados = await SolicitacaoAtendimentoModel.listarTodas();
            res.status(200).json(resultados);
        } catch (err) {
            console.error('Erro ao listar solicitações:', err);
            res.status(500).json({ error: 'Erro ao listar solicitações.', details: err.message });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await SolicitacaoAtendimentoModel.buscarPorId(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Solicitação não encontrada.' });
            }
            res.status(200).json(resultado);
        } catch (err) {
            console.error('Erro ao buscar solicitação:', err);
            res.status(500).json({ error: 'Erro ao buscar solicitação.', details: err.message });
        }
    },

    buscarPorUsuario: async (req, res) => {
        try {
            const { id_usuario } = req.params;
            const resultados = await SolicitacaoAtendimentoModel.buscarPorUsuario(id_usuario);
            res.status(200).json(resultados);
        } catch (err) {
            console.error('Erro ao buscar solicitações por usuário:', err);
            res.status(500).json({ error: 'Erro ao buscar solicitações.', details: err.message });
        }
    },

    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await SolicitacaoAtendimentoModel.buscarPorId(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Solicitação não encontrada.' });
            }
            const dados = req.body;
            await SolicitacaoAtendimentoModel.editar(id, dados);
            res.status(200).json({ message: 'Solicitação atualizada com sucesso!' });
        } catch (err) {
            console.error('Erro ao editar solicitação:', err);
            res.status(500).json({ error: 'Erro ao editar solicitação.', details: err.message });
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;
            const resultado = await SolicitacaoAtendimentoModel.buscarPorId(id);
            if (!resultado) {
                return res.status(404).json({ error: 'Solicitação não encontrada.' });
            }
            await SolicitacaoAtendimentoModel.deletar(id);
            res.status(200).json({ message: 'Solicitação excluída com sucesso!' });
        } catch (err) {
            console.error('Erro ao deletar solicitação:', err);
            res.status(500).json({ error: 'Erro ao deletar solicitação.', details: err.message });
        }
    }
};

module.exports = SolicitacaoAtendimentoController;

const HistoricoAtendimentoModel = require('../models/historicoAtendimentoModel');

const HistoricoAtendimentoController = {
    buscarPorUsuario: async (req, res) => {
        try {
            const { id_usuario } = req.params;
            const usuarioLogado = req.usuario;

            // Só permite se for Adm ou o próprio usuário
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id_usuario) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const resultados = await HistoricoAtendimentoModel.buscarPorUsuario(id_usuario);

            if (!resultados || resultados.length === 0) {
                return res.status(404).json({ message: 'Nenhum histórico de atendimento encontrado para este usuário.' });
            }

            const resultadosComStatus = resultados.map(item => {
                const status = item.bp_atendimento ? 'Executado' : 'Pendente';
                return { ...item, status };
            });

            resultadosComStatus.sort((a, b) => {
                if (a.status === 'Pendente' && b.status !== 'Pendente') return -1;
                if (a.status !== 'Pendente' && b.status === 'Pendente') return 1;
                return 0;
            });

            res.status(200).json(resultadosComStatus);
        } catch (err) {
            console.error('Erro ao buscar histórico por usuário:', err);
            res.status(500).json({ error: 'Erro ao buscar histórico por usuário.', details: err.message });
        }
    },

    buscarTodos: async (req, res) => {
        const usuarioLogado = req.usuario;
        // Apenas administradores podem listar todos
        if (!usuarioLogado || usuarioLogado.tipo_usuario !== 'Adm') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
        try {
            const resultados = await HistoricoAtendimentoModel.buscarTodos();

            if (!resultados || resultados.length === 0) {
                return res.status(200).json({ message: 'Nenhum histórico de atendimento encontrado.' });
            }

            const resultadosComStatus = resultados.map(atendimento => {
                const status = atendimento.bp_atendimento ? 'Executado' : 'Pendente';
                return { ...atendimento, status };
            });
            res.status(200).json(resultadosComStatus);
        } catch (err) {
            console.error('Erro ao buscar todos os atendimentos:', err);
            res.status(500).json({ error: 'Erro ao buscar todos os atendimentos.', details: err.message });
        }
    },

    adicionarAtendimento: async (req, res) => {
        try {
            const novoAtendimento = req.body;
            const usuarioLogado = req.usuario;

            // Só permite se for Adm ou o próprio usuário
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != novoAtendimento.id_usuario) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            if (!novoAtendimento || Object.keys(novoAtendimento).length === 0) {
                return res.status(400).json({ error: 'Erro ao adicionar atendimento.', details: 'O corpo da requisição não pode estar vazio.' });
            }
            const resultado = await HistoricoAtendimentoModel.adicionarAtendimento(novoAtendimento);
            res.status(201).json({ message: 'Atendimento adicionado com sucesso!', atendimentoId: resultado.insertId });
        } catch (err) {
            console.error('Erro ao adicionar atendimento:', err);
            res.status(500).json({ error: 'Erro ao adicionar atendimento.', details: err.message });
        }
    },

    buscarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioLogado = req.usuario;
            const resultado = await HistoricoAtendimentoModel.buscarPorId(id);
            if (resultado) {
                // Só permite se for Adm ou dono do atendimento
                if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != resultado.id_usuario) {
                    return res.status(403).json({ error: 'Acesso negado.' });
                }
                const atendimentoComStatus = { ...resultado, status: resultado.bp_atendimento ? 'Executado' : 'Pendente' };
                res.status(200).json(atendimentoComStatus);
            } else {
                res.status(404).json({ message: 'Atendimento não encontrado.' });
            }
        } catch (err) {
            console.error('Erro ao buscar atendimento por ID:', err);
            res.status(500).json({ error: 'Erro ao buscar atendimento.', details: err.message });
        }
    },

    atualizarAtendimento: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioLogado = req.usuario;
            const dadosAtualizados = req.body;
            const resultado = await HistoricoAtendimentoModel.buscarPorId(id);
            if (!resultado) {
                return res.status(404).json({ message: 'Atendimento não encontrado.' });
            }
            // Só permite se for Adm ou dono do atendimento
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != resultado.id_usuario) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }
            if (!dadosAtualizados || Object.keys(dadosAtualizados).length === 0) {
                return res.status(400).json({ error: 'Erro ao atualizar atendimento.', details: 'O corpo da requisição não pode estar vazio para atualização.' });
            }
            const updateResult = await HistoricoAtendimentoModel.atualizarAtendimento(id, dadosAtualizados);
            if (updateResult.affectedRows > 0) {
                res.status(200).json({ message: 'Atendimento atualizado com sucesso!' });
            } else {
                res.status(404).json({ message: 'Atendimento não encontrado.' });
            }
        } catch (err) {
            console.error('Erro ao atualizar atendimento:', err);
            res.status(500).json({ error: 'Erro ao atualizar atendimento.', details: err.message });
        }
    },

    excluirAtendimento: async (req, res) => {
        try {
            const { id } = req.params;
            const usuarioLogado = req.usuario;
            const resultado = await HistoricoAtendimentoModel.buscarPorId(id);
            if (!resultado) {
                return res.status(404).json({ message: 'Atendimento não encontrado.' });
            }
            // Só permite se for Adm ou dono do atendimento
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != resultado.id_usuario) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }
            const deleteResult = await HistoricoAtendimentoModel.excluirAtendimento(id);
            if (deleteResult.affectedRows > 0) {
                res.status(200).json({ message: 'Atendimento excluído com sucesso!' });
            } else {
                res.status(404).json({ message: 'Atendimento não encontrado.' });
            }
        } catch (err) {
            console.error('Erro ao excluir atendimento:', err);
            res.status(500).json({ error: 'Erro ao excluir atendimento.', details: err.message });
        }
    },

    buscarAtendimentosRealizados: async (req, res) => {
        const usuarioLogado = req.usuario;
        // Apenas administradores podem listar todos realizados
        if (!usuarioLogado || usuarioLogado.tipo_usuario !== 'Adm') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
        try {
            const resultados = await HistoricoAtendimentoModel.buscarAtendimentosRealizados();
            if (!resultados || resultados.length === 0) {
                return res.status(200).json({ message: 'Nenhum atendimento realizado encontrado.' });
            }
            res.status(200).json(resultados);
        } catch (err) {
            console.error('Erro ao buscar atendimentos realizados:', err);
            res.status(500).json({ error: 'Erro ao buscar atendimentos realizados.', details: err.message });
        }
    }
};

module.exports = HistoricoAtendimentoController;
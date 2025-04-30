const UsuariosModel = require('../models/usuariosModel');

const UsuariosController = {
    cadastrarUsuario: (req, res) => {
        const {
            nome,
            cpf,
            rg,
            endereco,
            email,
            num_sus,
            bp_tratamento,
            bp_acompanhamento,
            tipo_usuario,
            id_responsavel,
            foto_url
        } = req.body;

        if (!nome || !cpf) {
            return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
        }

        const tiposValidos = ['responsavel', 'paciente'];
        if (!tiposValidos.includes(tipo_usuario)) {
            return res.status(400).json({ error: `Tipo de usuário inválido. Valores permitidos: ${tiposValidos.join(', ')}` });
        }

        if (tipo_usuario === 'paciente' && !id_responsavel) {
            return res.status(400).json({ error: 'O campo id_responsavel é obrigatório para pacientes.' });
        }

        const novoUsuario = {
            nome,
            cpf,
            rg,
            endereco,
            email,
            num_sus,
            bp_tratamento,
            bp_acompanhamento,
            tipo_usuario,
            id_responsavel,
            foto_url
        };

        UsuariosModel.criarUsuario(novoUsuario, (err, result) => {
            if (err) {
                console.error('Erro ao cadastrar usuário:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ error: 'CPF já cadastrado.' });
                }
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }

            const idUsuario = result.insertId;

            UsuariosModel.registrarEvento(idUsuario, 'cadastro', (errEvento) => {
                if (errEvento) {
                    console.error('Erro ao registrar evento de cadastro:', errEvento);
                    return res.status(500).json({ error: 'Erro ao registrar evento de cadastro.' });
                }

                res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: idUsuario });
            });
        });
    },

    buscarUsuariosPorNome: (req, res) => {
        const { nome } = req.query;

        if (!nome) {
            return res.status(400).json({ error: 'O nome é obrigatório para a busca.' });
        }

        UsuariosModel.buscarPorNome(nome, (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuários:', err);
                return res.status(500).json({ error: 'Erro ao buscar usuários.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com o nome fornecido.' });
            }

            res.status(200).json(results);
        });
    },

    deletarUsuario: (req, res) => {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
        }

        UsuariosModel.buscarPorId(id, (err, usuario) => {
            if (err) {
                console.error('Erro ao verificar usuário:', err);
                return res.status(500).json({ error: 'Erro ao verificar usuário.' });
            }

            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Registrar evento antes da exclusão
            UsuariosModel.registrarEvento(id, 'usuario deletado', (errEvento) => {
                if (errEvento) {
                    console.error('Erro ao registrar evento de exclusão:', errEvento);
                    return res.status(500).json({ error: 'Erro ao registrar evento de exclusão.' });
                }

                // Excluir usuário após registrar o evento
                UsuariosModel.deletarUsuario(id, (err) => {
                    if (err) {
                        console.error('Erro ao deletar usuário:', err);
                        return res.status(500).json({ error: 'Erro ao deletar usuário.' });
                    }

                    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
                });
            });
        });
    }
};

module.exports = UsuariosController;

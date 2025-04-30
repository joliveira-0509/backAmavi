const UsuariosModel = require('../models/usuariosModel');

const UsuariosController = {
    getUsuarios: (req, res) => {
        UsuariosModel.getAll((err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao buscar usuários.' });
            }
            res.status(200).json(results);
        });
    },

    createUsuario: (req, res) => {
        // Exemplo de criação de usuário (pode ser ajustado conforme necessário)
        res.status(201).json({ message: 'Usuário criado!' });
    },

    cadastrarUsuario: (req, res) => {
        const { nome, cpf, rg, endereco, email, num_sus, bp_tratamento, bp_acompanhamento, tipo_usuario, id_responsavel, foto_url } = req.body;

        // Validação básica
        if (!nome || !cpf) {
            return res.status(400).json({ error: 'Nome e CPF são obrigatórios.' });
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
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
            }
            res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: result.insertId });
        });
    }
};

module.exports = UsuariosController;

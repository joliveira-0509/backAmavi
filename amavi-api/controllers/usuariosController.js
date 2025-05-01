const UsuariosModel = require('../models/usuariosModel');

function calcularIdade(dataNasc) {
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

const UsuariosController = {
    cadastrarUsuario: async (req, res) => {
        try {
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
                data_nascimento,
                foto_url
            } = req.body;

            // Validação de campos obrigatórios
            if (!nome || !cpf || !data_nascimento || !tipo_usuario) {
                return res.status(400).json({ error: 'Nome, CPF, data de nascimento e tipo de usuário são obrigatórios.' });
            }

            // Validação do tipo de usuário
            const tiposValidos = ['responsavel', 'usuario', 'dependente'];
            if (!tiposValidos.includes(tipo_usuario)) {
                return res.status(400).json({ error: `Tipo de usuário inválido. Valores permitidos: ${tiposValidos.join(', ')}` });
            }

            // Calcular idade
            const idade = calcularIdade(data_nascimento);

            // Regras de negócio para cada tipo de usuário
            if (tipo_usuario === 'usuario' && idade < 18) {
                return res.status(400).json({ error: 'Usuário do tipo "usuario" deve ser maior de idade.' });
            }

            if (tipo_usuario === 'dependente') {
                if (idade >= 18) {
                    return res.status(400).json({ error: 'Usuário do tipo "dependente" deve ser menor de idade.' });
                }
                if (!id_responsavel) {
                    return res.status(400).json({ error: 'O campo id_responsavel é obrigatório para usuários do tipo dependente.' });
                }

                // Verificar se o responsável existe
                const responsavel = await UsuariosModel.buscarPorId(id_responsavel);
                if (!responsavel) {
                    return res.status(404).json({ error: 'Responsável não encontrado.' });
                }
            }

            if (tipo_usuario === 'responsavel' && id_responsavel) {
                return res.status(400).json({ error: 'Usuários do tipo "responsavel" não devem possuir id_responsavel.' });
            }

            // Criar o novo usuário
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
                id_responsavel: tipo_usuario === 'dependente' ? id_responsavel : null,
                data_nascimento,
                foto_url
            };

            const result = await UsuariosModel.criarUsuario(novoUsuario);
            const idUsuario = result.insertId;

            // Registrar evento de cadastro
            await UsuariosModel.registrarEvento(idUsuario, 'cadastro');

            return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: idUsuario });
        } catch (err) {
            console.error('Erro ao cadastrar usuário:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'CPF já cadastrado.' });
            }
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
        }
    },

    buscarUsuariosPorNome: async (req, res) => {
        try {
            const { nome } = req.query;
            if (!nome) {
                return res.status(400).json({ error: 'O nome é obrigatório para a busca.' });
            }

            const results = await UsuariosModel.buscarPorNome(nome);
            if (results.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com o nome fornecido.' });
            }

            return res.status(200).json(results);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        }
    },

    deletarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            const usuario = await UsuariosModel.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Registrar evento de exclusão
            await UsuariosModel.registrarEvento(id, 'exclusao');

            // Deletar o usuário
            await UsuariosModel.deletarUsuario(id);

            return res.status(200).json({ message: 'Usuário deletado com sucesso!' });
        } catch (err) {
            console.error('Erro ao deletar usuário:', err);
            return res.status(500).json({ error: 'Erro ao deletar usuário.' });
        }
    }
};

module.exports = UsuariosController;

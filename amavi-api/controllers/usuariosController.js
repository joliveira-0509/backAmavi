const UsuariosModel = require('../models/usuariosModel');
const db = require('../db/db'); // Adicionar a importação do banco de dados

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

// Função auxiliar para validação de tipo de usuário
function validarTipoUsuario(tipo_usuario, idade, id_responsavel) {
    const tiposValidos = ['responsavel', 'usuario', 'dependente'];
    if (!tiposValidos.includes(tipo_usuario)) {
        return `Tipo de usuário inválido. Valores permitidos: ${tiposValidos.join(', ')}`;
    }

    if (tipo_usuario === 'usuario' && idade < 18) {
        return 'Usuário do tipo "usuario" deve ser maior de idade.';
    }

    if (tipo_usuario === 'dependente') {
        if (idade >= 18) {
            return 'Usuário do tipo "dependente" deve ser menor de idade.';
        }
        if (!id_responsavel) {
            return 'O campo id_responsavel é obrigatório para usuários do tipo dependente.';
        }
    }

    if (tipo_usuario === 'responsavel' && id_responsavel) {
        return 'Usuários do tipo "responsavel" não devem possuir id_responsavel.';
    }

    return null;
}

const UsuariosController = {
    cadastrarUsuario: async (req, res) => {
        try {
            const usuario = req.body;

            // 1. Cadastrar o usuário na tabela Login
            const loginSql = `
                INSERT INTO Login (nome, senha, cpf, tipo_usuario) VALUES (?, ?, ?, ?)
            `;
            const [loginResult] = await db.promise().execute(loginSql, [
                usuario.nome,
                usuario.senha,
                usuario.cpf,
                usuario.tipo_usuario || 'usuario' // Define o tipo de usuário como 'usuario' por padrão
            ]);

            // Obter o ID do usuário recém-criado na tabela Login
            const id_usuario = loginResult.insertId;

            // 2. Cadastrar o usuário na tabela Usuarios
            const usuarioSql = `
                INSERT INTO Usuarios (id, nome, cpf, rg, endereco, email, num_sus, bp_tratamento, bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await db.promise().execute(usuarioSql, [
                id_usuario, // O ID do usuário na tabela Usuarios é o mesmo da tabela Login
                usuario.nome,
                usuario.cpf,
                usuario.rg,
                usuario.endereco,
                usuario.email,
                usuario.num_sus,
                usuario.bp_tratamento,
                usuario.bp_acompanhamento,
                usuario.tipo_usuario || 'responsavel', // Define o tipo de usuário como 'responsavel' por padrão
                usuario.id_responsavel,
                usuario.data_nascimento,
                usuario.foto_url
            ]);

            // 3. Registrar evento de cadastro na tabela EventoUsuario
            const eventoSql = `
                INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)
            `;
            await db.promise().execute(eventoSql, [id_usuario, 'cadastro']);

            return res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: id_usuario });
        } catch (err) {
            console.error('Erro ao cadastrar usuário:', err.message);
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
    },

    buscarPorId: async (id) => {
        try {
            const sql = `SELECT * FROM Usuarios WHERE id = ?`;
            const [rows] = await db.promise().execute(sql, [id]); // Usar db.promise() para evitar erros
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            throw err;
        }
    }
};

module.exports = UsuariosController;

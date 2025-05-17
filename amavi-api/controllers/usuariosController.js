const bcrypt = require('bcryptjs');
const UsuariosModel = require('../models/usuariosModel');
const db = require('../db/db'); 

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
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const usuario = req.body;
            const tipo_usuario = (usuario.tipo_usuario || 'responsavel').toLowerCase().trim();

            const idade = calcularIdade(usuario.data_nascimento);
            const erroValidacao = validarTipoUsuario(tipo_usuario, idade, usuario.id_responsavel);
            if (erroValidacao) {
                return res.status(400).json({ error: erroValidacao });
            }

            // Criptografar a senha antes de salvar
            const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);

            // 1. Cadastrar na tabela Login
            const loginSql = `
                INSERT INTO Login (nome, senha, cpf) VALUES (?, ?, ?)
            `;
            const [loginResult] = await conn.execute(loginSql, [
                usuario.nome,
                senhaCriptografada,
                usuario.cpf
            ]);

            const id_usuario = loginResult.insertId;

            // 2. Cadastrar na tabela Usuarios
            const usuarioSql = `
                INSERT INTO Usuarios (
                    nome, cpf, rg, endereco, email, num_sus, bp_tratamento,
                    bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            await conn.execute(usuarioSql, [
                usuario.nome,
                usuario.cpf,
                usuario.rg,
                usuario.endereco,
                usuario.email,
                usuario.num_sus,
                usuario.bp_tratamento,
                usuario.bp_acompanhamento,
                tipo_usuario,
                usuario.id_responsavel || null,
                usuario.data_nascimento,
                usuario.foto_url
            ]);

            // 3. Registrar evento
            const eventoSql = `
                INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)
            `;
            await conn.execute(eventoSql, [id_usuario, 'cadastro']);

            await conn.commit();
            conn.release();

            return res.status(201).json({
                message: 'Usuário cadastrado com sucesso!',
                id: id_usuario
            });

        } catch (err) {
            await conn.rollback();
            conn.release();
            console.error('Erro ao cadastrar usuário:', err.message, err);
            return res.status(500).json({
                error: 'Erro ao cadastrar usuário.',
                details: err.message
            });
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
            return res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
        }
    },

    buscarTodosUsuarios: async (req, res) => {
        try {
            const sql = `SELECT * FROM Usuarios`;
            const [rows] = await db.execute(sql);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado.' });
            }

            return res.status(200).json(rows);
        } catch (err) {
            console.error('Erro ao buscar todos os usuários:', err);
            return res.status(500).json({ error: 'Erro ao buscar todos os usuários.', details: err.message });
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

            await UsuariosModel.registrarEvento(id, 'exclusao');
            await UsuariosModel.deletarUsuario(id);

            return res.status(200).json({ message: 'Usuário deletado com sucesso!' });
        } catch (err) {
            console.error('Erro ao deletar usuário:', err);
            return res.status(500).json({ error: 'Erro ao deletar usuário.', details: err.message });
        }
    },

    // Atualizar todos os dados do usuário (PUT)
    atualizarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            await UsuariosModel.putUsuario(id, usuario);
            await UsuariosModel.registrarEvento(id, 'atualizacao');

            return res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
        } catch (err) {
            console.error('Erro ao atualizar usuário (PUT):', err);
            return res.status(500).json({ error: 'Erro ao atualizar usuário.', details: err.message });
        }
    },

    // Atualizar parcialmente os dados do usuário (PATCH)
    atualizarUsuarioParcial: async (req, res) => {
        try {
            const { id } = req.params;
            const campos = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            await UsuariosModel.patchUsuario(id, campos);
            await UsuariosModel.registrarEvento(id, 'atualizacao_parcial');

            return res.status(200).json({ message: 'Usuário atualizado parcialmente com sucesso!' });
        } catch (err) {
            console.error('Erro ao atualizar usuário (PATCH):', err);
            return res.status(500).json({ error: 'Erro ao atualizar usuário parcialmente.', details: err.message });
        }
    },

    buscarPorId: async (id) => {
        try {
            const sql = `SELECT * FROM Usuarios WHERE id = ?`;
            const [rows] = await db.execute(sql, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            throw err;
        }
    }
};

module.exports = UsuariosController;

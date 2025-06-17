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
    // Cadastro permanece aberto!
    cadastrarUsuario: async (req, res) => {
        const conn = await db.getConnection();
        try {
            const usuario = req.body;

            if (!usuario.senha || !usuario.nome || !usuario.cpf) {
                return res.status(400).json({ error: 'Campos obrigatórios (nome, cpf, senha) não informados.' });
            }

            await conn.beginTransaction();

            const tipo_usuario = (usuario.tipo_usuario || 'responsavel').toLowerCase().trim();
            const idade = calcularIdade(usuario.data_nascimento);
            const erroValidacao = validarTipoUsuario(tipo_usuario, idade, usuario.id_responsavel);
            if (erroValidacao) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ error: erroValidacao });
            }

            const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);

            // Login
            const loginSql = `INSERT INTO Login (nome, senha, cpf) VALUES (?, ?, ?)`;
            await conn.execute(loginSql, [usuario.nome, senhaCriptografada, usuario.cpf]);

            // Usuarios
            const usuarioSql = `
                INSERT INTO Usuarios (
                    nome, cpf, rg, endereco, email, num_sus, bp_tratamento,
                    bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento,
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const [usuarioResult] = await conn.execute(usuarioSql, [
                usuario.nome,
                usuario.cpf,
                usuario.rg || null,
                usuario.endereco || null,
                usuario.email || null,
                usuario.num_sus || null,
                usuario.bp_tratamento || null,
                usuario.bp_acompanhamento || null,
                tipo_usuario,
                usuario.id_responsavel || null,
                usuario.data_nascimento,
               
            ]);

            const id_usuario = usuarioResult.insertId;

            // Evento
            const eventoSql = `INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)`;
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

    // Só o próprio usuário ou Adm pode buscar por nome
    buscarUsuariosPorNome: async (req, res) => {
        try {
            const { nome } = req.query;
            const usuarioLogado = req.usuario;

            if (!nome) {
                return res.status(400).json({ error: 'O nome é obrigatório para a busca.' });
            }

            // Se não for Adm, só pode buscar o próprio nome
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.nome !== nome) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const results = await UsuariosModel.buscarPorNome(nome);
            if (results.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com o nome fornecido.' });
            }

            // Se não for Adm, só retorna o próprio registro
            if (usuarioLogado.tipo_usuario !== 'Adm') {
                const filtrado = results.filter(u => u.id === usuarioLogado.id);
                if (filtrado.length === 0) {
                    return res.status(404).json({ error: 'Usuário não encontrado.' });
                }
                return res.status(200).json(filtrado);
            }

            return res.status(200).json(results);
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
        }
    },

    buscarPorId: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        try {
            // Só permite se for Adm ou o próprio usuário
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const usuario = await UsuariosModel.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            return res.status(200).json(usuario);
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuário por ID.' });
        }
    },

    atualizarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const usuario = req.body;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            // Só permite se for Adm ou o próprio usuário
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
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

    atualizarUsuarioParcial: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const campos = req.body;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            // Só permite se for Adm ou o próprio usuário
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
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

    deletarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            // Só permite se for Adm ou o próprio usuário
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
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

    buscarTodosUsuarios: async (req, res) => {
        // Apenas administradores podem listar todos
        if (!req.usuario || req.usuario.tipo_usuario !== 'Adm') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
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
};

module.exports = UsuariosController;

const jwt = require('jsonwebtoken');
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const LoginModel = require('../models/loginModel');
const SECRET_KEY = process.env.SECRET_KEY || 'sua_chave_secreta';

/**
 * Valida o CPF informado.
 */
function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.charAt(10));
}

/**
 * Realiza login do usuário e retorna dados no token.
 */
exports.login = async (req, res) => {
    const { cpf, senha } = req.body;
    const conn = await db.getConnection();

    try {
        const [result] = await conn.execute(
            'SELECT * FROM Login WHERE cpf = ?',
            [cpf]
        );

        if (result.length === 0) {
            return res.status(401).json({ error: 'CPF ou senha inválidos.' });
        }

        const loginData = result[0];
        const senhaCorreta = await bcrypt.compare(senha, loginData.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ error: 'CPF ou senha inválidos.' });
        }

        // Buscar dados adicionais na tabela Usuarios
        const [usuarioRows] = await conn.execute(
            'SELECT id, nome, tipo_usuario FROM Usuarios WHERE cpf = ?',
            [cpf]
        );

        const usuario = usuarioRows[0];
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const payload = {
            id: usuario.id,
            nome: usuario.nome,
            tipo_usuario: usuario.tipo_usuario,
            cpf: cpf
        };

        const token = jwt.sign(payload, process.env.SECRET_KEY || 'sua_chave_secreta', {
            expiresIn: '4h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true só em produção
            sameSite: 'None',
            maxAge: 1000 * 60 * 60 * 4
        });

        res.status(200).json({
            message: 'Login bem-sucedido.',
            usuario: payload
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro no login.' });
    } finally {
        conn.release();
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none'
    });
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

exports.atualizarSenha = async (req, res) => {
    const { senha_atual, nova_senha } = req.body;

    if (!req.usuario) return res.status(401).json({ error: 'Usuário não autenticado.' });

    try {
        const usuarioLogin = await LoginModel.buscarPorCpf(req.usuario.cpf);
        if (!usuarioLogin) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const senhaCorreta = await bcrypt.compare(senha_atual, usuarioLogin.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const senhaCriptografada = await bcrypt.hash(nova_senha, 10);
        const sql = `UPDATE Login SET senha = ? WHERE cpf = ?`;
        await db.execute(sql, [senhaCriptografada, req.usuario.cpf]);

        res.status(200).json({ message: 'Senha atualizada com sucesso.' });

    } catch (err) {
        console.error('Erro ao atualizar senha:', err);
        res.status(500).json({ error: 'Erro interno ao atualizar senha.' });
    }
};

exports.cadastrarAdm = async (req, res) => {
    const { cpf, senha, nome } = req.body;

    if (!cpf || !senha || !nome) {
        return res.status(400).json({ error: 'CPF, senha e nome são obrigatórios.' });
    }

    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    try {
        const usuarioExistente = await LoginModel.buscarPorCpf(cpf);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Este CPF já está cadastrado.' });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoAdm = { cpf, senha: senhaCriptografada, tipo_usuario: 'Adm', nome };
        const adminCriado = await LoginModel.criarLogin(novoAdm);

        res.status(201).json({ message: 'Administrador cadastrado com sucesso!', admin: adminCriado });
    } catch (err) {
        console.error('Erro ao cadastrar administrador:', err);
        res.status(500).json({ error: 'Erro interno ao cadastrar administrador.' });
    }
};

exports.deletarAdm = async (req, res) => {
    const { cpf } = req.params;

    if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório.' });
    if (!validateCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

    try {
        const usuario = await LoginModel.buscarPorCpf(cpf);
        if (!usuario || usuario.tipo_usuario !== 'Adm') {
            return res.status(404).json({ error: 'Administrador não encontrado.' });
        }

        await LoginModel.deletarPorCpf(cpf);
        res.status(200).json({ message: 'Administrador deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar administrador:', err);
        res.status(500).json({ error: 'Erro interno ao deletar administrador.' });
    }
};

exports.deletarLogin = async (req, res) => {
    const { cpf } = req.params;

    if (!cpf) return res.status(400).json({ error: 'CPF é obrigatório.' });
    if (!validateCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

    try {
        const usuario = await LoginModel.buscarPorCpf(cpf);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        await LoginModel.deletarPorCpf(cpf);
        res.status(200).json({ message: 'Login deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar login:', err);
        res.status(500).json({ error: 'Erro interno ao deletar login.' });
    }
};

/**
 * Middleware para autenticação via JWT.
 */
exports.autenticarToken = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

/**
 * Middleware para verificar se é administrador.
 */
exports.somenteAdmin = (req, res, next) => {
    if (req.usuario?.tipo_usuario !== 'Adm') {
        return res.status(403).json({ error: 'Acesso restrito a administradores.' });
    }
    next();
};

/**
 * Verifica os dados do usuário logado.
 */
exports.verificarLogin = async (req, res) => {
    try {
        const usuario = await LoginModel.buscarPorCpf(req.usuario.cpf);

        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado.' });
        }

        return res.json({
            id: usuario.id,
            nome: usuario.nome,
            tipo_usuario: usuario.tipo_usuario,
            cpf: usuario.cpf
        });
    } catch (err) {
        console.error('Erro na verificação do login:', err);
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};
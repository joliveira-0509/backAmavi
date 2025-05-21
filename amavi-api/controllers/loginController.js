// loginController.js

const jwt = require('jsonwebtoken');
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const LoginModel = require('../models/loginModel');
const SECRET_KEY = process.env.SECRET_KEY || 'sua_chave_secreta';

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

exports.login = async (req, res) => {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) return res.status(400).json({ error: 'CPF e senha são obrigatórios.' });
    if (!validateCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

    try {
        const usuarioLogin = await LoginModel.buscarPorCpf(cpf);
        if (!usuarioLogin) return res.status(401).json({ message: 'Usuário não encontrado.' });

        const senhaValida = await bcrypt.compare(senha, usuarioLogin.senha);
        if (!senhaValida) return res.status(401).json({ message: 'Senha incorreta.' });

        const token = jwt.sign(
            {
                id: usuarioLogin.id,
                cpf: usuarioLogin.cpf,
                tipo_usuario: usuarioLogin.tipo_usuario
            },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            message: `Login bem-sucedido como ${usuarioLogin.tipo_usuario === 'Adm' ? 'administrador' : 'usuário'}.`,
            tipo_usuario: usuarioLogin.tipo_usuario,
            token
        });

    } catch (err) {
        console.error('Erro ao realizar login:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

exports.atualizarSenha = async (req, res) => {
    const { senha_atual, nova_senha } = req.body;
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const usuarioLogin = await LoginModel.buscarPorCpf(decoded.cpf);

        if (!usuarioLogin) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const senhaCorreta = await bcrypt.compare(senha_atual, usuarioLogin.senha);
        if (!senhaCorreta) return res.status(401).json({ error: 'Senha atual incorreta.' });

        const senhaCriptografada = await bcrypt.hash(nova_senha, 10);

        const sql = `UPDATE Login SET senha = ? WHERE cpf = ?`;
        await db.execute(sql, [senhaCriptografada, decoded.cpf]);

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

    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório.' });
    }

    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

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

// Middleware para autenticar token JWT (para proteger rotas)
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


exports.verificarLogin = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ erro: 'Usuário não autenticado' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const usuario = await LoginModel.buscarPorCpf(decoded.cpf);

        if (!usuario) {
            return res.status(404).json({ erro: 'Usuário não encontrado' });
        }

        return res.json({
            id: usuario.id,
            nome: usuario.nome,
            tipo_usuario: usuario.tipo_usuario,
            cpf: usuario.cpf
        });
    } catch (err) {
        console.error('Erro na verificação do login:', err);
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
};

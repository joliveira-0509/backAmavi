const jwt = require('jsonwebtoken');
const db = require('../db/db');
const bcrypt = require('bcrypt');
const LoginModel = require('../models/loginModel');
const UsuariosModel = require('../models/usuariosModel');

const SECRET_KEY = 'sua_chave_secreta'; // Use uma chave segura e armazene-a em variáveis de ambiente

exports.login = async (req, res) => {
    const { cpf, senha } = req.body;

    if (!cpf || !senha) {
        return res.status(400).json({ error: 'CPF e senha são obrigatórios.' });
    }

    try {
        // Busca o login na tabela Login
        const usuarioLogin = await LoginModel.buscarPorCpf(cpf);

        if (!usuarioLogin) {
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        // Opcional: Buscar informações adicionais do usuário
        const usuarioInfo = await UsuariosModel.buscarPorCpf(cpf);

        // Verifica a senha usando bcrypt
        const senhaValida = await bcrypt.compare(senha, usuarioLogin.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        // Gera o token JWT
        const token = jwt.sign({ id: usuarioLogin.id, cpf: usuarioLogin.cpf }, SECRET_KEY, { expiresIn: '1h' });

        // Define o cookie com o token
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hora
        res.status(200).json({ message: 'Login bem-sucedido.' });
    } catch (err) {
        console.error('Erro ao realizar login:', err);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

const jwt = require('jsonwebtoken');
const db = require('../db/db');
const bcrypt = require('bcrypt');
const LoginModel = require('../models/loginModel');
const UsuariosModel = require('../models/usuariosModel');
const SECRET_KEY = process.env.SECRET_KEY || 'sua_chave_secreta'; 



function validateCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]+/g, '');
    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
        return false;
    }
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    // Valida o primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(9))) {
        return false;
    }
    soma = 0;
    // Valida o segundo dígito verificador
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) {
        resto = 0;
    }
    if (resto !== parseInt(cpf.charAt(10))) {
        return false;
    }
    return true;
}
exports.login = async (req, res) => {
    const { cpf, senha } = req.body;
    if (!cpf || !senha) {
        return res.status(400).json({ error: 'CPF e senha são obrigatórios.' });
    }
    // Validação do CPF
    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }
    try {
        const usuarioLogin = await LoginModel.buscarPorCpf(cpf);
        if (!usuarioLogin) {
            return res.status(401).json({ message: 'Usuário não encontrado.' });
        }
        const senhaValida = await bcrypt.compare(senha, usuarioLogin.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }
        const token = jwt.sign({ id: usuarioLogin.id, cpf: usuarioLogin.cpf }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
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
exports.atualizarSenha = async (req, res) => {
    const { senha_atual, nova_senha } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const usuarioLogin = await LoginModel.buscarPorCpf(decoded.cpf);

        if (!usuarioLogin) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const senhaCorreta = await bcrypt.compare(senha_atual, usuarioLogin.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        const senhaCriptografada = await bcrypt.hash(nova_senha, 10);

        const sql = `UPDATE Login SET senha = ? WHERE cpf = ?`;
        await db.execute(sql, [senhaCriptografada, decoded.cpf]);

        return res.status(200).json({ message: 'Senha atualizada com sucesso.' });

    } catch (err) {
        console.error('Erro ao atualizar senha:', err);
        return res.status(500).json({ error: 'Erro interno ao atualizar senha.' });
    }
};

// loginController.js

const jwt = require('jsonwebtoken');
const db = require('../db/db');
const bcrypt = require('bcrypt');
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
            tipo_usuario: usuarioLogin.tipo_usuario
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

    // Verifica se os campos obrigatórios foram fornecidos
    if (!cpf || !senha || !nome) {
        return res.status(400).json({ error: 'CPF, senha e nome são obrigatórios.' });
    }

    // Valida o CPF
    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    try {
        // Verifica se o CPF já existe
        const usuarioExistente = await LoginModel.buscarPorCpf(cpf);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Este CPF já está cadastrado.' });
        }

        // Criptografa a senha
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Cria o objeto com as informações do administrador
        const novoAdm = { cpf, senha: senhaCriptografada, tipo_usuario: 'Adm', nome };

        // Cadastra o novo administrador no banco de dados
        const adminCriado = await LoginModel.criarLogin(novoAdm);

        res.status(201).json({ message: 'Administrador cadastrado com sucesso!', admin: adminCriado });
    } catch (err) {
        console.error('Erro ao cadastrar administrador:', err);
        res.status(500).json({ error: 'Erro interno ao cadastrar administrador.' });
    }
};
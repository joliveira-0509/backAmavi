// loginController.js

const jwt = require('jsonwebtoken');
const db = require('../db/db');
const bcrypt = require('bcryptjs');
const LoginModel = require('../models/loginModel');
const SECRET_KEY = process.env.SECRET_KEY || 'sua_chave_secreta';

/**
 * Valida o CPF informado.
 * Retorna true se válido, false caso contrário.
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
 * Realiza o login do usuário.
 * Valida CPF, senha e gera token JWT.
 */
exports.login = async (req, res) => {
    const { cpf, senha } = req.body;

    // Verifica se CPF e senha foram enviados
    if (!cpf || !senha) {
        return res.status(400).json({ error: 'CPF e senha são obrigatórios.' });
    }
    // Valida o formato do CPF
    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    try {
        // Busca usuário pelo CPF
        const usuarioLogin = await LoginModel.buscarPorCpf(cpf);
        if (!usuarioLogin) {
            return res.status(401).json({ message: 'Usuário não encontrado. Verifique o CPF informado.' });
        }

        // Compara senha informada com a senha salva (criptografada)
        const senhaValida = await bcrypt.compare(senha, usuarioLogin.senha);
        if (!senhaValida) {
            return res.status(401).json({ message: 'Senha incorreta. Tente novamente.' });
        }

        // Gera token JWT
        const token = jwt.sign(
            {
                id: usuarioLogin.id,
                cpf: usuarioLogin.cpf,
                tipo_usuario: usuarioLogin.tipo_usuario
            },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Define cookie seguro com o token
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
        // Log detalhado do erro para debug
        console.error('Erro ao realizar login:', err);
        res.status(500).json({ error: 'Erro interno no servidor ao tentar realizar login.' });
    }
};

/**
 * Realiza logout limpando o cookie do token.
 */
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
};

/**
 * Atualiza a senha do usuário autenticado.
 * Exige senha atual e nova senha.
 */
exports.atualizarSenha = async (req, res) => {
    const { senha_atual, nova_senha } = req.body;
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido. Faça login novamente.' });
    }

    try {
        // Decodifica token e busca usuário
        const decoded = jwt.verify(token, SECRET_KEY);
        const usuarioLogin = await LoginModel.buscarPorCpf(decoded.cpf);

        if (!usuarioLogin) {
            return res.status(404).json({ error: 'Usuário não encontrado para atualização de senha.' });
        }

        // Verifica se a senha atual está correta
        const senhaCorreta = await bcrypt.compare(senha_atual, usuarioLogin.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ error: 'Senha atual incorreta.' });
        }

        // Criptografa nova senha e atualiza no banco
        const senhaCriptografada = await bcrypt.hash(nova_senha, 10);

        const sql = `UPDATE Login SET senha = ? WHERE cpf = ?`;
        await db.execute(sql, [senhaCriptografada, decoded.cpf]);

        res.status(200).json({ message: 'Senha atualizada com sucesso.' });

    } catch (err) {
        console.error('Erro ao atualizar senha:', err);
        res.status(500).json({ error: 'Erro interno ao atualizar senha. Tente novamente mais tarde.' });
    }
};

/**
 * Cadastra um novo administrador.
 * Exige CPF, senha e nome.
 */
exports.cadastrarAdm = async (req, res) => {
    const { cpf, senha, nome } = req.body;

    // Valida campos obrigatórios
    if (!cpf || !senha || !nome) {
        return res.status(400).json({ error: 'CPF, senha e nome são obrigatórios.' });
    }

    // Valida CPF
    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    try {
        // Verifica se já existe usuário com o CPF informado
        const usuarioExistente = await LoginModel.buscarPorCpf(cpf);
        if (usuarioExistente) {
            return res.status(400).json({ error: 'Este CPF já está cadastrado.' });
        }

        // Criptografa senha antes de salvar
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const novoAdm = { cpf, senha: senhaCriptografada, tipo_usuario: 'Adm', nome };

        const adminCriado = await LoginModel.criarLogin(novoAdm);

        res.status(201).json({ message: 'Administrador cadastrado com sucesso!', admin: adminCriado });
    } catch (err) {
        console.error('Erro ao cadastrar administrador:', err);
        res.status(500).json({ error: 'Erro interno ao cadastrar administrador. Verifique os dados e tente novamente.' });
    }
};

/**
 * Deleta um administrador pelo CPF.
 */
exports.deletarAdm = async (req, res) => {
    const { cpf } = req.params;

    if (!cpf) {
        return res.status(400).json({ error: 'CPF é obrigatório.' });
    }

    if (!validateCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    try {
        // Busca usuário e verifica se é administrador
        const usuario = await LoginModel.buscarPorCpf(cpf);
        if (!usuario || usuario.tipo_usuario !== 'Adm') {
            return res.status(404).json({ error: 'Administrador não encontrado.' });
        }

        await LoginModel.deletarPorCpf(cpf);

        res.status(200).json({ message: 'Administrador deletado com sucesso.' });
    } catch (err) {
        console.error('Erro ao deletar administrador:', err);
        res.status(500).json({ error: 'Erro interno ao deletar administrador. Tente novamente.' });
    }
};

/**
 * Middleware para autenticar token JWT (protege rotas privadas).
 */
exports.autenticarToken = (req, res, next) => {
    // Tenta obter token do cookie ou do header Authorization
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido. Acesso negado.' });
    }

    try {
        // Valida token
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado. Faça login novamente.' });
    }
};

/**
 * Verifica se o usuário está autenticado e retorna seus dados.
 */
exports.verificarLogin = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ erro: 'Usuário não autenticado. Faça login.' });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        const usuario = await LoginModel.buscarPorCpf(decoded.cpf);

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
        return res.status(401).json({ erro: 'Token inválido ou expirado. Faça login novamente.' });
    }
};

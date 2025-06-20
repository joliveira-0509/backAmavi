// Importa o módulo bcryptjs para criptografar senhas
const bcrypt = require('bcryptjs');
// Importa o modelo de usuários
const UsuariosModel = require('../models/usuariosModel');
// Importa a conexão com o banco de dados
const db = require('../db/db');

/**
 * Função auxiliar para calcular a idade a partir da data de nascimento
 * @param {string} dataNasc - Data de nascimento no formato ISO
 * @returns {number} idade calculada
 */
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

/**
 * Valida o tipo de usuário, idade e relação de dependência
 * @param {string} tipo_usuario - Tipo do usuário (responsavel, usuario, dependente)
 * @param {number} idade - Idade do usuário
 * @param {number|null} id_responsavel - ID do responsável, se houver
 * @returns {string|null} Mensagem de erro ou null se válido
 */
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

// Controlador de Usuários com métodos para CRUD e validações
const UsuariosController = {
    /**
     * Cadastra um novo usuário no sistema
     * - Cria login, usuário, registra evento e trata upload de foto
     */
    cadastrarUsuario: async (req, res) => {
        const conn = await db.getConnection();
        try {
            const usuario = req.body;
            const foto = req.file; // 📸 Pega a imagem enviada via multer

            // Validação de campos obrigatórios
            if (!usuario.senha || !usuario.nome || !usuario.cpf) {
                return res.status(400).json({ error: 'Campos obrigatórios (nome, cpf, senha) não informados.' });
            }

            await conn.beginTransaction();

            // Define tipo de usuário e valida regras de negócio
            const tipo_usuario = (usuario.tipo_usuario || 'responsavel').toLowerCase().trim();
            const idade = calcularIdade(usuario.data_nascimento);
            const erroValidacao = validarTipoUsuario(tipo_usuario, idade, usuario.id_responsavel);
            if (erroValidacao) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({ error: erroValidacao });
            }

            // Criptografa a senha
            const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);

            // Insere login na tabela Login
            const loginSql = `INSERT INTO Login (nome, senha, cpf) VALUES (?, ?, ?)`;
            await conn.execute(loginSql, [usuario.nome, senhaCriptografada, usuario.cpf]);

            // Define URL da foto se enviada
            let foto_url = null;
            if (foto) {
                foto_url = `/uploads/${foto.filename}`;
            }

            // Insere usuário na tabela Usuarios
            const usuarioSql = `
                INSERT INTO Usuarios (
                    nome, cpf, rg, endereco, email, num_sus, bp_tratamento,
                    bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                foto_url
            ]);

            const id_usuario = usuarioResult.insertId;

            // Registra evento de cadastro
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

    /**
     * Busca usuários pelo nome
     * - Apenas o próprio usuário ou administradores podem buscar
     */
    buscarUsuariosPorNome: async (req, res) => {
        try {
            const { nome } = req.query;
            const usuarioLogado = req.usuario;

            // Validação do parâmetro nome
            if (!nome) {
                return res.status(400).json({ error: 'O nome é obrigatório para a busca.' });
            }

            // Restringe busca para não administradores
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.nome !== nome) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            // Busca usuários pelo nome
            const results = await UsuariosModel.buscarPorNome(nome);
            if (results.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com o nome fornecido.' });
            }

            // Se não for Adm, retorna apenas o próprio registro
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

    /**
     * Busca usuário por ID
     * - Apenas o próprio usuário ou administradores podem buscar
     */
    buscarPorId: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        try {
            // Restringe acesso para não administradores
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            // Busca usuário pelo ID
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

    /**
     * Atualiza todos os dados de um usuário (PUT)
     * - Apenas o próprio usuário ou administradores podem atualizar
     */
    atualizarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const usuario = req.body;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            // Restringe acesso para não administradores
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            // Verifica se o usuário existe
            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Atualiza usuário e registra evento
            await UsuariosModel.putUsuario(id, usuario);
            await UsuariosModel.registrarEvento(id, 'atualizacao');

            return res.status(200).json({ message: 'Usuário atualizado com sucesso!' });
        } catch (err) {
            console.error('Erro ao atualizar usuário (PUT):', err);
            return res.status(500).json({ error: 'Erro ao atualizar usuário.', details: err.message });
        }
    },

    /**
     * Atualiza parcialmente os dados de um usuário (PATCH)
     * - Apenas o próprio usuário ou administradores podem atualizar
     */
    atualizarUsuarioParcial: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const campos = req.body;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            // Restringe acesso para não administradores
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            // Verifica se o usuário existe
            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Atualiza parcialmente e registra evento
            await UsuariosModel.patchUsuario(id, campos);
            await UsuariosModel.registrarEvento(id, 'atualizacao_parcial');

            return res.status(200).json({ message: 'Usuário atualizado parcialmente com sucesso!' });
        } catch (err) {
            console.error('Erro ao atualizar usuário (PATCH):', err);
            return res.status(500).json({ error: 'Erro ao atualizar usuário parcialmente.', details: err.message });
        }
    },

    /**
     * Deleta um usuário do sistema
     * - Apenas o próprio usuário ou administradores podem deletar
     */
    deletarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            // Restringe acesso para não administradores
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            // Verifica se o usuário existe
            const usuario = await UsuariosModel.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            // Registra evento e deleta usuário
            await UsuariosModel.registrarEvento(id, 'exclusao');
            await UsuariosModel.deletarUsuario(id);

            return res.status(200).json({ message: 'Usuário deletado com sucesso!' });
        } catch (err) {
            console.error('Erro ao deletar usuário:', err);
            return res.status(500).json({ error: 'Erro ao deletar usuário.', details: err.message });
        }
    },

    /**
     * Lista todos os usuários do sistema
     * - Apenas administradores podem acessar
     */
    buscarTodosUsuarios: async (req, res) => {
        // Apenas administradores podem listar todos
        if (!req.usuario || req.usuario.tipo_usuario !== 'Adm') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
        try {
            // Busca todos os usuários
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

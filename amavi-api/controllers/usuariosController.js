const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs para criptografar senhas
const UsuariosModel = require('../models/usuariosModel'); // Importa o modelo de usuários
const db = require('../db/db'); // Importa a conexão com o banco de dados

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
 * Valida o formato do CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} true se o CPF é válido, false caso contrário
 */
function validarCpf(cpf) {
    const cpfLimpo = cpf.replace(/[.\-]/g, '');
    return /^\d{11}$/.test(cpfLimpo);
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
     */
    cadastrarUsuario: async (req, res) => {
        let conn;
        try {
            if (req.fileValidationError) {
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (req.files && req.files.error) {
                return res.status(400).json({ error: req.files.error });
            }

            conn = await db.getConnection();
            const usuario = { ...req.body };

            if (usuario.cpf && !validarCpf(usuario.cpf)) {
                return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
            }

            const arquivos = req.files || {};
            const foto_blob = arquivos.foto_blob?.[0]?.buffer || null;
            const laudo_blob = arquivos.laudo_medico?.[0]?.buffer || null;

            for (const key in usuario) {
                if (usuario[key] === undefined) {
                    usuario[key] = null;
                }
            }

            if (!usuario.nome || !usuario.cpf || !usuario.senha) {
                return res.status(400).json({ error: 'Campos obrigatórios (nome, cpf, senha) não informados.' });
            }

            const [existing] = await conn.execute(`SELECT 1 FROM Login WHERE cpf = ?`, [usuario.cpf]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'CPF já cadastrado.' });
            }

            await conn.beginTransaction();

            const tipo_usuario = (usuario.tipo_usuario || 'responsavel').toLowerCase().trim();
            const idade = calcularIdade(usuario.data_nascimento);
            const erroValidacao = validarTipoUsuario(tipo_usuario, idade, usuario.id_responsavel);

            if (erroValidacao) {
                return res.status(400).json({ error: erroValidacao });
            }

            const senhaCriptografada = await bcrypt.hash(usuario.senha, 10);

            await conn.execute(
                `INSERT INTO Login (nome, senha, cpf) VALUES (?, ?, ?)`,
                [usuario.nome, senhaCriptografada, usuario.cpf]
            );

            await conn.execute(`
                INSERT INTO Usuarios (
                    nome, cpf, telefone, rg, profissao, endereco, rua, numero, cidade, estado, cep, sexo, email, num_sus, laudo_medico, informacoes_medicas, senha, bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_blob, criado_em
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                usuario.nome,
                usuario.cpf,
                usuario.telefone || null,
                usuario.rg || null,
                usuario.profissao || null,
                usuario.endereco || null,
                usuario.rua || null,
                usuario.numero || null,
                usuario.cidade || null,
                usuario.estado || null,
                usuario.cep || null,
                usuario.sexo || null,
                usuario.email || null,
                usuario.num_sus || null,
                laudo_blob,
                usuario.informacoes_medicas || null,
                senhaCriptografada,
                usuario.bp_acompanhamento || null,
                tipo_usuario,
                usuario.id_responsavel || null,
                usuario.data_nascimento,
                foto_blob,
                usuario.criado_em || new Date()
            ]);

            await conn.commit();
            return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

        } catch (err) {
            if (conn) await conn.rollback();
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.', details: err.message });
        } finally {
            if (conn) conn.release();
        }
    },

    /**
     * Busca usuários pelo nome
     */
    buscarUsuariosPorNome: async (req, res) => {
        try {
            const { nome } = req.query;
            const usuarioLogado = req.usuario;

            if (!nome) {
                return res.status(400).json({ error: 'O nome é obrigatório para a busca.' });
            }

            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.nome !== nome) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const results = await UsuariosModel.buscarPorNome(nome);
            if (results.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado com o nome fornecido.' });
            }

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
     */
    buscarPorId: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        try {
            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const usuario = await UsuariosModel.buscarPorId(id);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (usuario.foto_blob) {
                usuario.foto_base64 = `data:image/jpeg;base64,${usuario.foto_blob.toString('base64')}`;
            } else {
                usuario.foto_base64 = null;
            }
            delete usuario.foto_blob;

            return res.status(200).json(usuario);
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuário por ID.', details: err.message });
        }
    },

    /**
     * Atualiza todos os dados de um usuário (PUT)
     */
    atualizarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const usuario = { ...req.body };

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            for (const key in usuario) {
                if (usuario[key] === undefined) {
                    usuario[key] = null;
                }
            }

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
     */
    atualizarUsuarioParcial: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const campos = { ...req.body };

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            for (const key in campos) {
                if (campos[key] === undefined) {
                    campos[key] = null;
                }
            }

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
     */
    deletarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;

        try {
            if (!id) {
                return res.status(400).json({ error: 'ID do usuário é obrigatório.' });
            }

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

    /**
     * Lista todos os usuários do sistema
     */
    buscarTodosUsuarios: async (req, res) => {
        try {
            const sql = `SELECT * FROM Usuarios`;
            const [rows] = await db.execute(sql);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado.' });
            }

            const usuariosComFoto = rows.map(usuario => {
                if (usuario.foto_blob) {
                    usuario.foto_base64 = `data:image/jpeg;base64,${usuario.foto_blob.toString('base64')}`;
                } else {
                    usuario.foto_base64 = null;
                }
                delete usuario.foto_blob;
                return usuario;
            });

            return res.status(200).json(usuariosComFoto);
        } catch (err) {
            console.error('Erro ao buscar todos os usuários:', err);
            return res.status(500).json({ error: 'Erro ao buscar todos os usuários.', details: err.message });
        }
    },

    /**
     * Atualiza apenas a foto do usuário
     */
    uploadFotoUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const foto = req.file;

        try {
            if (req.fileValidationError) {
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (req.files && req.files.error) {
                return res.status(400).json({ error: req.files.error });
            }

            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.id != id) {
                return res.status(403).json({ error: 'Acesso negado.' });
            }

            const usuarioExistente = await UsuariosModel.buscarPorId(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (!foto) {
                return res.status(400).json({ error: 'Nenhuma foto enviada.' });
            }

            const foto_blob = foto.buffer;
            await UsuariosModel.atualizarFoto(id, foto_blob);
            await UsuariosModel.registrarEvento(id, 'atualizacao_foto');

            return res.status(200).json({ message: 'Foto atualizada com sucesso!' });
        } catch (err) {
            console.error('Erro ao atualizar foto do usuário:', err);
            return res.status(500).json({ error: 'Erro ao atualizar foto do usuário.', details: err.message });
        }
    },

    /**
     * Busca usuário por CPF
     */
    buscarPorCpf: async (req, res) => {
        try {
            const { cpf } = req.params;
            const usuarioLogado = req.usuario;

            if (!validarCpf(cpf)) {
                return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
            }

            if (usuarioLogado.tipo_usuario !== 'Adm' && usuarioLogado.cpf !== cpf.replace(/[.\-]/g, '')) {
                return res.status(403).json({ error: 'Acesso negado. Apenas administradores ou o próprio usuário podem buscar por CPF.' });
            }

            const usuario = await UsuariosModel.buscarPorCpf(cpf.replace(/[.\-]/g, ''));
            if (!usuario) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (usuario.foto_blob) {
                usuario.foto_base64 = `data:image/jpeg;base64,${usuario.foto_blob.toString('base64')}`;
            } else {
                usuario.foto_base64 = null;
            }
            delete usuario.foto_blob;

            return res.status(200).json(usuario);
        } catch (err) {
            console.error('Erro ao buscar usuário por CPF:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuário por CPF.', details: err.message });
        }
    }
};

module.exports = UsuariosController;

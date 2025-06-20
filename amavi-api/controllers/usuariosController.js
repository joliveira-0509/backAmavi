const bcrypt = require('bcryptjs');
const UsuariosModel = require('../models/usuariosModel');
const db = require('../db/db');
const { substituirUndefinedPorNull } = require('../utils/limparCampos');

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
        let conn;
        try {
            if (req.fileValidationError) {
                console.log('Erro de campo inesperado (multer):', req.fileValidationError);
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (req.files && req.files.error) {
                console.log('Erro de campo inesperado (multer):', req.files.error);
                return res.status(400).json({ error: req.files.error });
            }

            console.log('Campos de arquivo recebidos:', Object.keys(req.files || {}));

            conn = await db.getConnection();
            const usuario = substituirUndefinedPorNull(req.body);
            const arquivos = req.files || {};

            const foto_blob = arquivos.foto?.[0]?.buffer || null;
            const laudo_blob = arquivos.laudoMedico?.[0]?.buffer || null;

            if (!usuario.senha || !usuario.nome || !usuario.cpf) {
                return res.status(400).json({ error: 'Campos obrigatórios (nome, cpf, senha) não informados.' });
            }

            await conn.beginTransaction();

            const tipo_usuario = (usuario.tipo_usuario || 'responsavel').toLowerCase().trim();
            const idade = calcularIdade(usuario.data_nascimento);
            const erroValidacao = validarTipoUsuario(tipo_usuario, idade, usuario.id_responsavel);

            if (erroValidacao) {
                await conn.rollback();
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
                usuario.telefone,
                usuario.rg,
                usuario.profissao,
                usuario.endereco,
                usuario.rua,
                usuario.numero,
                usuario.cidade,
                usuario.estado,
                usuario.cep,
                usuario.sexo,
                usuario.email,
                usuario.num_sus,
                laudo_blob,
                usuario.informacoes_medicas,
                senhaCriptografada,
                usuario.bp_acompanhamento,
                tipo_usuario,
                usuario.id_responsavel,
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
            return res.status(500).json({ error: 'Erro ao buscar usuário por ID.' });
        }
    },

    atualizarUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const usuario = substituirUndefinedPorNull(req.body);

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
        const campos = substituirUndefinedPorNull(req.body);

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
        if (!req.usuario || req.usuario.tipo_usuario !== 'Adm') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
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

    uploadFotoUsuario: async (req, res) => {
        const { id } = req.params;
        const usuarioLogado = req.usuario;
        const foto = req.file;

        try {
            if (req.fileValidationError) {
                console.log('Erro de campo inesperado (multer):', req.fileValidationError);
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (req.files && req.files.error) {
                console.log('Erro de campo inesperado (multer):', req.files.error);
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
};

module.exports = UsuariosController;

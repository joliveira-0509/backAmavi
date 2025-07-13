const bcrypt = require('bcryptjs'); // Importa a biblioteca bcryptjs para criptografar senhas
const UsuariosModel = require('../models/usuariosModel'); // Importa o modelo de usuários
const db = require('../db/db'); // Importa a conexão com o banco de dados

/**
 * Função auxiliar para calcular a idade a partir da data de nascimento
 * @param {string} dataNasc - Data de nascimento no formato ISO
 * @returns {number} idade calculada
 */
function calcularIdade(dataNasc) {
    const hoje = new Date(); // Obtém a data atual
    const nascimento = new Date(dataNasc); // Converte a data de nascimento para objeto Date
    let idade = hoje.getFullYear() - nascimento.getFullYear(); // Calcula a idade
    const mes = hoje.getMonth() - nascimento.getMonth(); // Calcula a diferença de meses
    // Ajusta a idade se o aniversário ainda não ocorreu este ano
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade; // Retorna a idade calculada
}

/**
 * Valida o tipo de usuário, idade e relação de dependência
 * @param {string} tipo_usuario - Tipo do usuário (responsavel, usuario, dependente)
 * @param {number} idade - Idade do usuário
 * @param {number|null} id_responsavel - ID do responsável, se houver
 * @returns {string|null} Mensagem de erro ou null se válido
 */
function validarTipoUsuario(tipo_usuario, idade, id_responsavel) {
    const tiposValidos = ['responsavel', 'usuario', 'dependente']; // Tipos de usuários válidos
    // Verifica se o tipo de usuário é válido
    if (!tiposValidos.includes(tipo_usuario)) {
        return `Tipo de usuário inválido. Valores permitidos: ${tiposValidos.join(', ')}`;
    }

    // Valida se o usuário do tipo "usuario" é maior de idade
    if (tipo_usuario === 'usuario' && idade < 18) {
        return 'Usuário do tipo "usuario" deve ser maior de idade.';
    }

    // Valida se o usuário do tipo "dependente" é menor de idade e se possui responsável
    if (tipo_usuario === 'dependente') {
        if (idade >= 18) {
            return 'Usuário do tipo "dependente" deve ser menor de idade.';
        }
        if (!id_responsavel) {
            return 'O campo id_responsavel é obrigatório para usuários do tipo dependente.';
        }
    }

    // Valida se o usuário do tipo "responsavel" não deve ter um responsável
    if (tipo_usuario === 'responsavel' && id_responsavel) {
        return 'Usuários do tipo "responsavel" não devem possuir id_responsavel.';
    }

    return null; // Retorna null se todas as validações passarem
}

// Controlador de Usuários com métodos para CRUD e validações
const UsuariosController = {
    /**
     * Cadastra um novo usuário no sistema
     * - Cria login, usuário, registra evento e trata upload de foto
     */
    cadastrarUsuario: async (req, res) => {
        let conn;
        try {
            // Tratamento para erro de campo inesperado do multer
            if (req.fileValidationError) {
                console.log('Erro de campo inesperado (multer):', req.fileValidationError);
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (req.files && req.files.error) {
                console.log('Erro de campo inesperado (multer):', req.files.error);
                return res.status(400).json({ error: req.files.error });
            }

            console.log('Campos de arquivo recebidos:', Object.keys(req.files || {}));

            conn = await db.getConnection(); // Obtém uma conexão com o banco de dados
            const usuario = { ...req.body }; // Cria uma cópia de req.body
            // Remove pontos e traços do CPF
            if (usuario.cpf) {
                usuario.cpf = usuario.cpf.replace(/[.\-]/g, '');
            }

            const arquivos = req.files || {}; // Obtém os arquivos enviados

            const foto_blob = arquivos.foto_blob?.[0]?.buffer || null;
            const laudo_blob = arquivos.laudo_medico?.[0]?.buffer || null;

            // Substitui valores undefined por null
            for (const key in usuario) {
                if (usuario[key] === undefined) {
                    usuario[key] = null;
                }
            }

            // Validação de campos obrigatórios
            if (!usuario.nome || !usuario.cpf || !usuario.senha) {
                await conn.rollback(); // Desfaz a transação em caso de erro
                return res.status(400).json({ error: 'Campos obrigatórios (nome, cpf, senha) não informados.' });
            }

            // Validação do formato do CPF (agora aceita pontos e traços no input)
            if (!/^\d{11}$/.test(usuario.cpf)) {
                await conn.rollback();
                return res.status(400).json({ error: 'CPF inválido. Deve conter 11 dígitos numéricos.' });
            }

            // Validação da data de nascimento
            if (!usuario.data_nascimento || isNaN(new Date(usuario.data_nascimento).getTime())) {
                await conn.rollback();
                return res.status(400).json({ error: 'Data de nascimento inválida.' });
            }

            // Verifica unicidade do CPF
            const [existing] = await conn.execute(`SELECT 1 FROM Login WHERE cpf = ?`, [usuario.cpf]);
            if (existing.length > 0) {
                await conn.rollback();
                return res.status(400).json({ error: 'CPF já cadastrado.' });
            }

            await conn.beginTransaction(); // Inicia uma transação

            const tipo_usuario = (usuario.tipo_usuario || 'responsavel').toLowerCase().trim(); // Define o tipo de usuário
            const idade = calcularIdade(usuario.data_nascimento); // Calcula a idade
            const erroValidacao = validarTipoUsuario(tipo_usuario, idade, usuario.id_responsavel); // Valida o tipo de usuário

            if (erroValidacao) {
                await conn.rollback();
                return res.status(400).json({ error: erroValidacao });
            }

            const senhaCriptografada = await bcrypt.hash(usuario.senha, 10); // Criptografa a senha

            // Insere o usuário na tabela Login
            await conn.execute(
                `INSERT INTO Login (nome, senha, cpf) VALUES (?, ?, ?)`,
                [usuario.nome, senhaCriptografada, usuario.cpf]
            );

            // Insere os dados do usuário na tabela Usuarios
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
                foto_blob, // <-- buffer da imagem
                usuario.criado_em || new Date()
            ]);

            await conn.commit(); // Confirma a transação
            return res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });

        } catch (err) {
            if (conn) await conn.rollback(); // Desfaz a transação em caso de erro
            if (err.name === 'MulterError' && err.code === 'LIMIT_UNEXPECTED_FILE') {
                console.log('Erro de campo inesperado (multer):', err);
                return res.status(400).json({ error: 'Campo de arquivo inesperado enviado.' });
            }
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar usuário.', details: err.message });
        } finally {
            if (conn) conn.release(); // Libera a conexão com o banco de dados
        }
    },

    /**
     * Busca usuários pelo nome
     * - Apenas o próprio usuário ou administradores podem buscar
     */
    buscarUsuariosPorNome: async (req, res) => {
        try {
            const { nome } = req.query; // Obtém o nome da query
            const usuarioLogado = req.usuario; // Obtém o usuário logado

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

            return res.status(200).json(results); // Retorna os resultados encontrados
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
        const { id } = req.params; // Obtém o ID da URL
        const usuarioLogado = req.usuario; // Obtém o usuário logado

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

            // Se houver foto_blob, converte para base64
            if (usuario.foto_blob) {
                usuario.foto_base64 = `data:image/jpeg;base64,${usuario.foto_blob.toString('base64')}`;
            } else {
                usuario.foto_base64 = null;
            }
            delete usuario.foto_blob; // Remove o campo foto_blob

            return res.status(200).json(usuario); // Retorna o usuário encontrado
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            return res.status(500).json({ error: 'Erro ao buscar usuário por ID.', details: err.message });
        }
    },

    /**
     * Atualiza todos os dados de um usuário (PUT)
     * - Apenas o próprio usuário ou administradores podem atualizar
     */
    atualizarUsuario: async (req, res) => {
        const { id } = req.params; // Obtém o ID da URL
        const usuarioLogado = req.usuario; // Obtém o usuário logado
        const usuario = { ...req.body }; // Cria uma cópia dos dados do usuário

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

            // Substitui valores undefined por null
            for (const key in usuario) {
                if (usuario[key] === undefined) {
                    usuario[key] = null;
                }
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
        const { id } = req.params; // Obtém o ID da URL
        const usuarioLogado = req.usuario; // Obtém o usuário logado
        const campos = { ...req.body }; // Cria uma cópia dos campos a serem atualizados

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

            // Substitui valores undefined por null
            for (const key in campos) {
                if (campos[key] === undefined) {
                    campos[key] = null;
                }
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
        const { id } = req.params; // Obtém o ID da URL
        const usuarioLogado = req.usuario; // Obtém o usuário logado

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
        if (!req.usuario || req.usuario.tipo_usuario !== 'Adm') {
            return res.status(403).json({ error: 'Acesso negado.' });
        }
        try {
            const sql = `SELECT * FROM Usuarios`; // Consulta SQL para buscar todos os usuários
            const [rows] = await db.execute(sql); // Executa a consulta

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Nenhum usuário encontrado.' });
            }

            // Adiciona foto_base64 em cada usuário
            const usuariosComFoto = rows.map(usuario => {
                if (usuario.foto_blob) {
                    usuario.foto_base64 = `data:image/jpeg;base64,${usuario.foto_blob.toString('base64')}`;
                } else {
                    usuario.foto_base64 = null;
                }
                delete usuario.foto_blob; // Remove o campo foto_blob
                return usuario; // Retorna o usuário modificado
            });

            return res.status(200).json(usuariosComFoto); // Retorna a lista de usuários
        } catch (err) {
            console.error('Erro ao buscar todos os usuários:', err);
            return res.status(500).json({ error: 'Erro ao buscar todos os usuários.', details: err.message });
        }
    },

    /**
     * Atualiza apenas a foto do usuário
     */
    uploadFotoUsuario: async (req, res) => {
        const { id } = req.params; // Obtém o ID da URL
        const usuarioLogado = req.usuario; // Obtém o usuário logado
        const foto = req.file; // Obtém a foto enviada

        try {
            // Tratamento para erro de campo inesperado do multer
            if (req.fileValidationError) {
                console.log('Erro de campo inesperado (multer):', req.fileValidationError);
                return res.status(400).json({ error: req.fileValidationError });
            }
            if (req.files && req.files.error) {
                console.log('Erro de campo inesperado (multer):', req.files.error);
                return res.status(400).json({ error: req.files.error });
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

            if (!foto) {
                return res.status(400).json({ error: 'Nenhuma foto enviada.' });
            }

            const foto_blob = foto.buffer; // Obtém o buffer da foto
            await UsuariosModel.atualizarFoto(id, foto_blob); // Atualiza a foto do usuário
            await UsuariosModel.registrarEvento(id, 'atualizacao_foto'); // Registra o evento de atualização

            return res.status(200).json({ message: 'Foto atualizada com sucesso!' }); // Retorna sucesso
        } catch (err) {
            if (err.name === 'MulterError' && err.code === 'LIMIT_UNEXPECTED_FILE') {
                console.log('Erro de campo inesperado (multer):', err);
                return res.status(400).json({ error: 'Campo de arquivo inesperado enviado.' });
            }
            console.error('Erro ao atualizar foto do usuário:', err);
            return res.status(500).json({ error: 'Erro ao atualizar foto do usuário.', details: err.message });
        }
    },
};

module.exports = UsuariosController;
const db = require('../db/db.js');

const UsuariosModel = {
    // Criar um novo usuário
    criarUsuario: async (usuario) => {
        try {
            const sql = `
                INSERT INTO Usuarios 
                (nome, cpf, rg, endereco, email, num_sus, bp_tratamento, bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                usuario.nome,
                usuario.cpf,
                usuario.rg,
                usuario.endereco,
                usuario.email,
                usuario.num_sus,
                usuario.bp_tratamento,
                usuario.bp_acompanhamento,
                usuario.tipo_usuario,
                usuario.id_responsavel,
                usuario.data_nascimento,
                usuario.foto_url
            ];
            const [result] = await db.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            throw err;
        }
    },

    // Buscar usuários pelo nome
    buscarPorNome: async (nome) => {
        try {
            const sql = `SELECT * FROM Usuarios WHERE nome LIKE ?`;
            const [result] = await db.execute(sql, [`%${nome}%`]);
            return result;
        } catch (err) {
            console.error('Erro ao buscar usuários por nome:', err);
            throw err;
        }
    },

    // Buscar usuário pelo ID
    buscarPorId: async (id) => {
        try {
            const sql = `SELECT * FROM Usuarios WHERE id = ?`;
            const [result] = await db.execute(sql, [id]);
            return result[0]; // Retorna o primeiro registro encontrado
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            throw err;
        }
    },

    // Deletar usuário pelo ID
    deletarUsuario: async (id) => {
        try {
            const sql = `DELETE FROM Usuarios WHERE id = ?`;
            const [result] = await db.execute(sql, [id]);
            return result;
        } catch (err) {
            console.error('Erro ao deletar usuário:', err);
            throw err;
        }
    },

    // Registrar evento (ex.: cadastro, exclusão)
    registrarEvento: async (id_usuario, tipo_evento) => {
        try {
            const sql = `INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)`;
            const [result] = await db.execute(sql, [id_usuario, tipo_evento]);
            return result;
        } catch (err) {
            console.error('Erro ao registrar evento:', err);
            throw err;
        }
    }
};

module.exports = UsuariosModel;

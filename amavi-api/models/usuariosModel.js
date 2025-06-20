const db = require('../db/db.js');

const UsuariosModel = {
    criarUsuario: async (usuario) => {
        try {
            const sql = `
                INSERT INTO Usuarios 
                (nome, cpf, rg, endereco, email, num_sus, bp_tratamento, bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_blob) 
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
                usuario.foto_blob || null   // <-- Salva o buffer da imagem
            ];
            const [result] = await db.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Erro ao criar usuário:', err);
            throw err;
        }
    },

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

    buscarPorId: async (id) => {
        try {
            const sql = `SELECT * FROM Usuarios WHERE id = ?`;
            const [result] = await db.execute(sql, [id]);
            return result[0];
        } catch (err) {
            console.error('Erro ao buscar usuário por ID:', err);
            throw err;
        }
    },

    buscarPorCpf: async (cpf) => {
        try {
            const sql = `SELECT * FROM Usuarios WHERE cpf = ?`;
            const [result] = await db.execute(sql, [cpf]);
            return result[0];
        } catch (err) {
            console.error('Erro ao buscar usuário por CPF:', err);
            throw err;
        }
    },

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

    putUsuario: async (id, usuario) => {
        try {
            const sql = `
                UPDATE Usuarios SET
                    nome = ?,
                    cpf = ?,
                    rg = ?,
                    endereco = ?,
                    email = ?,
                    num_sus = ?,
                    bp_tratamento = ?,
                    bp_acompanhamento = ?,
                    tipo_usuario = ?,
                    id_responsavel = ?,
                    data_nascimento = ?,
                    foto_blob = ?
                WHERE id = ?
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
                usuario.foto_blob || null,
                id
            ];
            const [result] = await db.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Erro ao atualizar usuário (PUT):', err);
            throw err;
        }
    },

    patchUsuario: async (id, campos) => {
        try {
            const keys = Object.keys(campos);
            const values = Object.values(campos);

            if (keys.length === 0) {
                throw new Error('Nenhum campo para atualizar.');
            }

            const setClause = keys.map(key => `${key} = ?`).join(', ');
            const sql = `UPDATE Usuarios SET ${setClause} WHERE id = ?`;
            values.push(id);

            const [result] = await db.execute(sql, values);
            return result;
        } catch (err) {
            console.error('Erro ao atualizar usuário (PATCH):', err);
            throw err;
        }
    },

    registrarEvento: async (id_usuario, tipo_evento) => {
        try {
            const sql = `INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)`;
            const [result] = await db.execute(sql, [id_usuario, tipo_evento]);
            return result;
        } catch (err) {
            console.error('Erro ao registrar evento:', err);
            throw err;
        }
    },

    atualizarFoto: async (id, foto_blob) => {
        try {
            const sql = `UPDATE Usuarios SET foto_blob = ? WHERE id = ?`;
            const [result] = await db.execute(sql, [foto_blob, id]);
            return result;
        } catch (err) {
            console.error('Erro ao atualizar foto do usuário:', err);
            throw err;
        }
    }
};

module.exports = UsuariosModel;

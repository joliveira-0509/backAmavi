const db = require('../db/db.js');

const LoginModel = {
    buscarPorCpf: async (cpf) => {
        try {
            const sql = `SELECT * FROM Login WHERE cpf = ?`;
            const [result] = await db.execute(sql, [cpf]);
            return result[0];
        } catch (err) {
            console.error('Erro ao buscar login por CPF:', err);
            throw err;
        }
    },

    criarLogin: async (login) => {
        try {
            const sql = `
                INSERT INTO Login (cpf, senha, tipo_usuario) 
                VALUES (?, ?, ?)
            `;
            const params = [login.cpf, login.senha, login.tipo_usuario || 'usuario'];
            const [result] = await db.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Erro ao criar login:', err);
            throw err;
        }
    },

    deletarLogin: async (id) => {
        try {
            const sql = `DELETE FROM Login WHERE id = ?`;
            const [result] = await db.execute(sql, [id]);
            return result;
        } catch (err) {
            console.error('Erro ao deletar login:', err);
            throw err;
        }
    }
};

module.exports = LoginModel;

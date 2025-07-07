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
                INSERT INTO Login (cpf, senha, tipo_usuario, nome) 
                VALUES (?, ?, ?, ?)
            `;
            const params = [login.cpf, login.senha, login.tipo_usuario || 'usuario', login.nome || null];
            const [result] = await db.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Erro ao criar login:', err);
            throw err;
        }
    },

    deletarPorCpf: async (cpf) => {
        try {
            const sql = `DELETE FROM Login WHERE cpf = ?`;
            const [result] = await db.execute(sql, [cpf]);
            return result;
        } catch (err) {
            console.error('Erro ao deletar login por CPF:', err);
            throw err;
        }
    }
};

module.exports = LoginModel;

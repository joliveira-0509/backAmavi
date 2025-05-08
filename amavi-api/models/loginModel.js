const db = require('../db/db.js');

const LoginModel = {
    // Buscar login pelo CPF
    buscarPorCpf: async (cpf) => {
        try {
            const sql = `SELECT * FROM Login WHERE cpf = ?`;
            const [result] = await db.execute(sql, [cpf]);
            return result[0]; // Retorna o primeiro registro encontrado
        } catch (err) {
            console.error('Erro ao buscar login por CPF:', err);
            throw err;
        }
    },

    // Criar um novo login
    criarLogin: async (login) => {
        try {
            const sql = `
                INSERT INTO Login (cpf, senha) 
                VALUES (?, ?)
            `;
            const params = [login.cpf, login.senha];
            const [result] = await db.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Erro ao criar login:', err);
            throw err;
        }
    },

    // Deletar login pelo ID
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

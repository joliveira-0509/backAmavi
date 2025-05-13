const db = require('../db/db');

const ColaboradorModel = {
    // Cadastrar novo colaborador
    async cadastrar(nome, cargo, email, telefone, foto_url) {
        const sql = `INSERT INTO Colaborador (nome, cargo, email, telefone, foto_url) VALUES (?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [nome, cargo, email, telefone, foto_url]);
        return result.insertId;
    },

    // Buscar todos os colaboradores
    async listarTodos() {
        const sql = `SELECT * FROM Colaborador`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // Buscar colaborador por ID
    async buscarPorId(id) {
        const sql = `SELECT * FROM Colaborador WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    // Atualizar colaborador
    async atualizar(id, nome, cargo, email, telefone, foto_url) {
        const sql = `UPDATE Colaborador SET nome = ?, cargo = ?, email = ?, telefone = ?, foto_url = ? WHERE id = ?`;
        await db.execute(sql, [nome, cargo, email, telefone, foto_url, id]);
    },

    // Deletar colaborador
    async deletar(id) {
        const sql = `DELETE FROM Colaborador WHERE id = ?`;
        await db.execute(sql, [id]);
    }
};

module.exports = ColaboradorModel;

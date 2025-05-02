const db = require('../db/db');

const DocumentacaoModel = {
    // Cadastrar nova documentação
    async cadastrar(id_usuario, inscricao) {
        const sql = `INSERT INTO Documentacao (id_usuario, inscricao) VALUES (?, ?)`;
        const [result] = await db.execute(sql, [id_usuario, inscricao]);
        return result.insertId;
    },

    // Buscar todas as documentações
    async listarTodas() {
        const sql = `SELECT * FROM Documentacao`;
        const [rows] = await db.execute(sql);
        return rows;
    },

    // Buscar documentação por ID
    async buscarPorId(id) {
        const sql = `SELECT * FROM Documentacao WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0] || null;
    },

    // Buscar documentação por ID do usuário
    async buscarPorUsuario(id_usuario) {
        const sql = `SELECT * FROM Documentacao WHERE id_usuario = ?`;
        const [rows] = await db.execute(sql, [id_usuario]);
        return rows;
    },

    // Atualizar documentação
    async atualizar(id, inscricao) {
        const sql = `UPDATE Documentacao SET inscricao = ? WHERE id = ?`;
        await db.execute(sql, [inscricao, id]);
    },

    // Deletar documentação
    async deletar(id) {
        const sql = `DELETE FROM Documentacao WHERE id = ?`;
        await db.execute(sql, [id]);
    }
};

module.exports = DocumentacaoModel;

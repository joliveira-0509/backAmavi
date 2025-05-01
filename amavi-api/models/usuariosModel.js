const db = require('../db/db.js'); 
const UsuariosModel = {
    criarUsuario: (usuario) => {
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

        return db.execute(sql, params);
    },

    buscarPorNome: (nome) => {
        const sql = `SELECT * FROM Usuarios WHERE nome LIKE ?`;
        return db.execute(sql, [`%${nome}%`]).then(result => result[0]);
    },

    buscarPorId: (id) => {
        const sql = `SELECT * FROM Usuarios WHERE id = ?`;
        return db.execute(sql, [id]).then(result => result[0][0]);
    },

    deletarUsuario: (id) => {
        const sql = `DELETE FROM Usuarios WHERE id = ?`;
        return db.execute(sql, [id]);
    },

    registrarEvento: (id_usuario, tipo_evento) => {
        const sql = `INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)`;
        return db.execute(sql, [id_usuario, tipo_evento]);
    }
};

module.exports = UsuariosModel;

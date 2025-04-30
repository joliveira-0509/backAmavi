const db = require('../db/db');

const UsuariosModel = {
    criarUsuario: (usuario, callback) => {
        const query = `
            INSERT INTO Usuarios (nome, cpf, rg, endereco, email, num_sus, bp_tratamento, bp_acompanhamento, tipo_usuario, id_responsavel, foto_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
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
            usuario.foto_url
        ];

        db.query(query, values, callback);
    },

    buscarPorCPF: (cpf, callback) => {
        const query = `SELECT * FROM Usuarios WHERE cpf = ?`;
        db.query(query, [cpf], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]); // Retorna o primeiro usuário encontrado ou null
        });
    },

    buscarPorNome: (nome, callback) => {
        const query = `SELECT * FROM Usuarios WHERE nome LIKE ?`;
        db.query(query, [`%${nome}%`], callback);
    },

    buscarPorId: (id, callback) => {
        const query = `SELECT * FROM Usuarios WHERE id = ?`;
        db.query(query, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]); // Retorna o primeiro usuário encontrado ou null
        });
    },

    registrarEvento: (idUsuario, tipoEvento, callback) => {
        const query = `
            INSERT INTO EventoUsuario (id_usuario, tipo_evento)
            VALUES (?, ?)
        `;
        const values = [idUsuario, tipoEvento];

        db.query(query, values, callback);
    },

    deletarUsuario: (id, callback) => {
        const query = `DELETE FROM Usuarios WHERE id = ?`;
        db.query(query, [id], callback);
    }
};

module.exports = UsuariosModel;
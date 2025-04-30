const db = require('../db/db');

const UsuariosModel = {
    criarUsuario: (usuario, callback) => {
        const query = `
            INSERT INTO Usuarios 
            (nome, cpf, rg, endereco, email, num_sus, bp_tratamento, bp_acompanhamento, tipo_usuario, id_responsavel, foto_url)
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

    registrarEvento: (idUsuario, tipoEvento, callback) => {
        const query = `
            INSERT INTO EventoUsuario (id_usuario, tipo_evento, data_evento)
            VALUES (?, ?, NOW())
        `;
        const values = [idUsuario, tipoEvento];
        console.log('Registrando evento:', values); // para depuração

        db.query(query, values, callback);
    },

    buscarPorId: (id, callback) => {
        const query = `SELECT * FROM Usuarios WHERE id = ?`;
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);
            callback(null, results[0]);
        });
    },

    deletarUsuario: (id, callback) => {
        const query = `DELETE FROM Usuarios WHERE id = ?`;
        db.query(query, [id], callback);
    },

    buscarPorNome: (nome, callback) => {
        const query = `SELECT * FROM Usuarios WHERE nome LIKE ?`;
        db.query(query, [`%${nome}%`], callback);
    },

    contarEventos: (callback) => {
        const query = `
            SELECT tipo_evento, COUNT(*) AS total
            FROM EventoUsuario
            GROUP BY tipo_evento
        `;
        db.query(query, callback);
    }
};

module.exports = UsuariosModel;

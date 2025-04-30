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
    }
};

module.exports = UsuariosModel;
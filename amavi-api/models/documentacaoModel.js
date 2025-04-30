const db = require('../db/db');

const DocumentacaoModel = {
    criarDocumento: (documento, callback) => {
        const query = `
            INSERT INTO Documentacao (id_usuario, inscricao)
            VALUES (?, ?)
        `;
        const values = [documento.id_usuario, documento.inscricao];

        db.query(query, values, callback);
    }
};

module.exports = DocumentacaoModel;
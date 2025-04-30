const DocumentacaoModel = require('../models/documentacaoModel');

const DocumentacaoController = {
    cadastrarDocumento: (req, res) => {
        const { id_usuario, inscricao } = req.body;

        // Validação básica
        if (!id_usuario || !inscricao) {
            return res.status(400).json({ error: 'ID do usuário e inscrição são obrigatórios.' });
        }

        const novoDocumento = { id_usuario, inscricao };

        DocumentacaoModel.criarDocumento(novoDocumento, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Erro ao cadastrar documento.' });
            }
            res.status(201).json({ message: 'Documento cadastrado com sucesso!', id: result.insertId });
        });
    }
};

module.exports = DocumentacaoController;
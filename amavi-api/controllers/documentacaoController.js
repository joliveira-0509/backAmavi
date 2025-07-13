const DocumentacaoModel = require('../models/documentacaoModel');

const DocumentacaoController = {
    // Cadastrar nova documentação com arquivo
    async cadastrar(req, res) {
        try {
            const { id_usuario, descricao } = req.body;
            const arquivoBuffer = req.file?.buffer;

            if (!id_usuario || !descricao || !arquivoBuffer) {
                return res.status(400).json({ error: 'id_usuario, descricao e arquivo são obrigatórios.' });
            }

            const id = await DocumentacaoModel.cadastrar(id_usuario, descricao, arquivoBuffer);
            return res.status(201).json({ message: 'Documentação cadastrada com sucesso.', id });
        } catch (err) {
            console.error('Erro ao cadastrar documentação:', err);
            return res.status(500).json({ error: 'Erro ao cadastrar documentação.' });
        }
    },

    // Listar todas as documentações (sem arquivos)
    async listarTodas(req, res) {
        try {
            const docs = await DocumentacaoModel.listarTodas();
            return res.status(200).json(docs);
        } catch (err) {
            console.error('Erro ao listar documentações:', err);
            return res.status(500).json({ error: 'Erro ao listar documentações.' });
        }
    },

    // Buscar uma documentação por ID (sem arquivo)
    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const doc = await DocumentacaoModel.buscarPorId(id);
            if (!doc) {
                return res.status(404).json({ error: 'Documentação não encontrada.' });
            }
            return res.status(200).json(doc);
        } catch (err) {
            console.error('Erro ao buscar documentação:', err);
            return res.status(500).json({ error: 'Erro ao buscar documentação.' });
        }
    },

    // Buscar somente o arquivo (para download ou visualização)
    async buscarArquivo(req, res) {
        try {
            const { id } = req.params;
            const arquivo = await DocumentacaoModel.buscarDocumentoPorId(id);

            if (!arquivo) {
                return res.status(404).json({ error: 'Arquivo não encontrado.' });
            }

            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(arquivo); // Buffer do arquivo
        } catch (err) {
            console.error('Erro ao buscar arquivo:', err);
            return res.status(500).json({ error: 'Erro ao buscar arquivo.' });
        }
    },

    // Buscar documentos por usuário
    async buscarPorUsuario(req, res) {
        try {
            const { id_usuario } = req.params;
            const docs = await DocumentacaoModel.buscarPorUsuario(id_usuario);
            return res.status(200).json(docs);
        } catch (err) {
            console.error('Erro ao buscar por usuário:', err);
            return res.status(500).json({ error: 'Erro ao buscar documentação do usuário.' });
        }
    },

    // Editar documentação (com ou sem novo arquivo)
    async editar(req, res) {
        try {
            const { id } = req.params;
            const { id_usuario, descricao } = req.body;
            const arquivoBuffer = req.file?.buffer;

            if (!id_usuario || !descricao) {
                return res.status(400).json({ error: 'id_usuario e descricao são obrigatórios.' });
            }

            await DocumentacaoModel.atualizar(id, id_usuario, descricao, arquivoBuffer);
            return res.status(200).json({ message: 'Documentação atualizada com sucesso.' });
        } catch (err) {
            console.error('Erro ao atualizar documentação:', err);
            return res.status(500).json({ error: 'Erro ao atualizar documentação.' });
        }
    },

    // Deletar documentação
    async deletar(req, res) {
        try {
            const { id } = req.params;
            await DocumentacaoModel.deletar(id);
            return res.status(200).json({ message: 'Documentação deletada com sucesso.' });
        } catch (err) {
            console.error('Erro ao deletar documentação:', err);
            return res.status(500).json({ error: 'Erro ao deletar documentação.' });
        }
    }
};

module.exports = DocumentacaoController;

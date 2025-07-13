const DocumentacaoModel = require('../models/documentacaoModel');

const DocumentacaoController = {
  // Cadastrar nova documentação com arquivo
  async cadastrar(req, res) {
    try {
      console.log('req.body:', req.body);
      console.log('req.file:', req.file);
      const { id_usuario, descricao } = req.body;
      const arquivoBuffer = req.file?.buffer;

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Apenas arquivos PDF, JPEG ou PNG são permitidos.' });
      }
      if (!id_usuario || !descricao || !arquivoBuffer) {
        return res.status(400).json({ error: 'id_usuario, descricao e arquivo são obrigatórios.' });
      }
      if (isNaN(id_usuario) || id_usuario <= 0) {
        return res.status(400).json({ error: 'id_usuario deve ser um número válido.' });
      }
      if (descricao.length > 255) {
        return res.status(400).json({ error: 'Descrição excede o limite de 255 caracteres.' });
      }

      const id = await DocumentacaoModel.cadastrar(id_usuario, descricao, arquivoBuffer);
      return res.status(201).json({ message: 'Documentação cadastrada com sucesso.', id });
    } catch (err) {
      console.error('Erro ao cadastrar documentação:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao cadastrar documentação.', detalhes: err.message });
    }
  },

  // Listar todas as documentações (sem arquivos)
  async listarTodas(req, res) {
    try {
      const docs = await DocumentacaoModel.listarTodas();
      return res.status(200).json(docs);
    } catch (err) {
      console.error('Erro ao listar documentações:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao listar documentações.', detalhes: err.message });
    }
  },

  // Buscar uma documentação por ID (sem arquivo)
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido.' });
      }
      const doc = await DocumentacaoModel.buscarPorId(id);
      if (!doc) {
        return res.status(404).json({ error: 'Documentação não encontrada.' });
      }
      return res.status(200).json(doc);
    } catch (err) {
      console.error('Erro ao buscar documentação:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao buscar documentação.', detalhes: err.message });
    }
  },

  // Buscar somente o arquivo (para download ou visualização)
  async buscarArquivo(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido.' });
      }
      const arquivo = await DocumentacaoModel.buscarDocumentoPorId(id);
      if (!arquivo) {
        return res.status(404).json({ error: 'Arquivo não encontrado.' });
      }
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', 'attachment; filename=documento');
      res.send(arquivo);
    } catch (err) {
      console.error('Erro ao buscar arquivo:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao buscar arquivo.', detalhes: err.message });
    }
  },

  // Buscar documentos por usuário
  async buscarPorUsuario(req, res) {
    try {
      const { id_usuario } = req.params;
      if (isNaN(id_usuario) || id_usuario <= 0) {
        return res.status(400).json({ error: 'id_usuario inválido.' });
      }
      const docs = await DocumentacaoModel.buscarPorUsuario(id_usuario);
      return res.status(200).json(docs);
    } catch (err) {
      console.error('Erro ao buscar por usuário:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao buscar documentação do usuário.', detalhes: err.message });
    }
  },

  // Editar documentação (com ou sem novo arquivo)
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario, descricao } = req.body;
      const arquivoBuffer = req.file?.buffer;

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido.' });
      }
      if (!id_usuario || !descricao) {
        return res.status(400).json({ error: 'id_usuario e descricao são obrigatórios.' });
      }
      if (isNaN(id_usuario) || id_usuario <= 0) {
        return res.status(400).json({ error: 'id_usuario deve ser um número válido.' });
      }
      if (descricao.length > 255) {
        return res.status(400).json({ error: 'Descrição excede o limite de 255 caracteres.' });
      }

      await DocumentacaoModel.atualizar(id, id_usuario, descricao, arquivoBuffer);
      return res.status(200).json({ message: 'Documentação atualizada com sucesso.' });
    } catch (err) {
      console.error('Erro ao atualizar documentação:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao atualizar documentação.', detalhes: err.message });
    }
  },

  // Deletar documentação
  async deletar(req, res) {
    try {
      const { id } = req.params;
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'ID inválido.' });
      }
      await DocumentacaoModel.deletar(id);
      return res.status(200).json({ message: 'Documentação deletada com sucesso.' });
    } catch (err) {
      console.error('Erro ao deletar documentação:', err.message, err.stack);
      return res.status(500).json({ error: 'Erro ao deletar documentação.', detalhes: err.message });
    }
  }
};

module.exports = DocumentacaoController;
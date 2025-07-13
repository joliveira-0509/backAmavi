const DocumentacaoModel = require('../models/documentacaoModel');
const UsuariosModel = require('../models/usuariosModel'); // Importa o model de usuários

const DocumentacaoController = {
  // Cadastrar documentação baseado no CPF
  async cadastrar(req, res) {
    try {
      const { cpf, descricao } = req.body;
      const arquivoBuffer = req.file?.buffer;

      if (!arquivoBuffer) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({ error: 'Apenas arquivos PDF, JPEG ou PNG são permitidos.' });
      }

      if (!cpf || !descricao) {
        return res.status(400).json({ error: 'CPF e descrição são obrigatórios.' });
      }
      if (descricao.length > 255) {
        return res.status(400).json({ error: 'Descrição excede 255 caracteres.' });
      }

      // Busca usuário pelo CPF
      const usuario = await UsuariosModel.buscarPorCpf(cpf);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado para o CPF informado.' });
      }
      const id_usuario = usuario.id;

      // Cadastra documentação usando id_usuario
      const id = await DocumentacaoModel.cadastrar(id_usuario, descricao, arquivoBuffer);
      return res.status(201).json({ message: 'Documentação cadastrada com sucesso.', id });
    } catch (err) {
      console.error('Erro ao cadastrar documentação:', err.message);
      return res.status(500).json({ error: 'Erro ao cadastrar documentação.', detalhes: err.message });
    }
  },

  async listarTodas(req, res) {
    try {
      const docs = await DocumentacaoModel.listarTodas();
      return res.status(200).json(docs);
    } catch (err) {
      console.error('Erro ao listar documentações:', err.message);
      return res.status(500).json({ error: 'Erro ao listar documentações.', detalhes: err.message });
    }
  },

  async buscarPorId(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || id <= 0) return res.status(400).json({ error: 'ID inválido.' });

      const doc = await DocumentacaoModel.buscarPorId(id);
      if (!doc) return res.status(404).json({ error: 'Documentação não encontrada.' });

      return res.status(200).json(doc);
    } catch (err) {
      console.error('Erro ao buscar documentação:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar documentação.', detalhes: err.message });
    }
  },

  async buscarArquivo(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || id <= 0) return res.status(400).json({ error: 'ID inválido.' });

      const arquivoBuffer = await DocumentacaoModel.buscarDocumentoPorId(id);
      if (!arquivoBuffer) return res.status(404).json({ error: 'Arquivo não encontrado.' });

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=documento_${id}`);
      return res.send(arquivoBuffer);
    } catch (err) {
      console.error('Erro ao buscar arquivo:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar arquivo.', detalhes: err.message });
    }
  },

  async buscarPorUsuario(req, res) {
    try {
      const id_usuario = Number(req.params.id_usuario);
      if (!id_usuario || id_usuario <= 0) return res.status(400).json({ error: 'id_usuario inválido.' });

      const docs = await DocumentacaoModel.buscarPorUsuario(id_usuario);
      return res.status(200).json(docs);
    } catch (err) {
      console.error('Erro ao buscar documentação do usuário:', err.message);
      return res.status(500).json({ error: 'Erro ao buscar documentação do usuário.', detalhes: err.message });
    }
  },

  async editar(req, res) {
    try {
      const id = Number(req.params.id);
      const { id_usuario, descricao } = req.body;
      const arquivoBuffer = req.file?.buffer;

      if (!id || id <= 0) return res.status(400).json({ error: 'ID inválido.' });
      if (!id_usuario || !descricao) return res.status(400).json({ error: 'id_usuario e descricao são obrigatórios.' });
      if (isNaN(id_usuario) || id_usuario <= 0) return res.status(400).json({ error: 'id_usuario deve ser válido.' });
      if (descricao.length > 255) return res.status(400).json({ error: 'Descrição excede 255 caracteres.' });

      await DocumentacaoModel.atualizar(id, id_usuario, descricao, arquivoBuffer || null);
      return res.status(200).json({ message: 'Documentação atualizada com sucesso.' });
    } catch (err) {
      console.error('Erro ao atualizar documentação:', err.message);
      return res.status(500).json({ error: 'Erro ao atualizar documentação.', detalhes: err.message });
    }
  },

  async deletar(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id || id <= 0) return res.status(400).json({ error: 'ID inválido.' });

      await DocumentacaoModel.deletar(id);
      return res.status(200).json({ message: 'Documentação deletada com sucesso.' });
    } catch (err) {
      console.error('Erro ao deletar documentação:', err.message);
      return res.status(500).json({ error: 'Erro ao deletar documentação.', detalhes: err.message });
    }
  }
};

module.exports = DocumentacaoController;

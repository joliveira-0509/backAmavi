const AgendaEventoModel = require('../models/agendaEventoModel');

const AgendaEventoController = {
  // Cadastrar evento com imagem
  cadastrarEvento: async (req, res) => {
    try {
      const {
        titulo,
        descricao,
        tipo_evento,
        data_evento,
        horario_evento,
        publico
      } = req.body;

      const foto_url = req.file ? req.file.buffer : null;

      const id = await AgendaEventoModel.cadastrar(
        titulo,
        descricao,
        tipo_evento,
        data_evento,
        horario_evento,
        publico,
        foto_url
      );

      return res.status(201).json({
        message: 'Evento cadastrado com sucesso!',
        id
      });
    } catch (err) {
      console.error('Erro ao cadastrar evento:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar evento.', details: err.message });
    }
  },

  listarEventos: async (req, res) => {
    try {
      const eventos = await AgendaEventoModel.listarTodos();
      return res.status(200).json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos:', err);
      return res.status(500).json({ error: 'Erro ao listar eventos.', details: err.message });
    }
  },

  listarEventosPorTipo: async (req, res) => {
    try {
      const { tipo_evento } = req.params;
      const eventos = await AgendaEventoModel.listarPorTipo(tipo_evento);

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Nenhum evento encontrado com esse tipo.' });
      }

      return res.status(200).json(eventos);
    } catch (err) {
      console.error('Erro ao buscar eventos por tipo:', err);
      return res.status(500).json({ error: 'Erro ao buscar eventos por tipo.', details: err.message });
    }
  },

  buscarEventoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const evento = await AgendaEventoModel.buscarPorId(id);

      if (!evento) {
        return res.status(404).json({ error: 'Evento não encontrado.' });
      }

      return res.status(200).json(evento);
    } catch (err) {
      console.error('Erro ao buscar evento por ID:', err);
      return res.status(500).json({ error: 'Erro ao buscar evento.', details: err.message });
    }
  },

  atualizarEvento: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        titulo,
        descricao,
        tipo_evento,
        data_evento,
        horario_evento,
        publico
      } = req.body;

      const foto_url = req.file ? req.file.buffer : null;

      await AgendaEventoModel.atualizar(
        id,
        titulo,
        descricao,
        tipo_evento,
        data_evento,
        horario_evento,
        publico,
        foto_url
      );

      return res.status(200).json({ message: 'Evento atualizado com sucesso!' });
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      return res.status(500).json({ error: 'Erro ao atualizar evento.', details: err.message });
    }
  },

  atualizarParcialEvento: async (req, res) => {
    try {
      const { id } = req.params;
      const dados = { ...req.body };

      // Se imagem foi enviada, adiciona ao dados para atualização
      if (req.file) {
        dados.foto_url = req.file.buffer;
      }

      await AgendaEventoModel.atualizarParcial(id, dados);

      return res.status(200).json({ message: 'Evento atualizado parcialmente com sucesso!' });
    } catch (err) {
      console.error('Erro ao atualizar parcialmente evento:', err);
      return res.status(500).json({ error: 'Erro ao atualizar evento.', details: err.message });
    }
  },

  deletarEvento: async (req, res) => {
    try {
      const { id } = req.params;

      await AgendaEventoModel.deletar(id);

      return res.status(200).json({ message: 'Evento deletado com sucesso!' });
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      return res.status(500).json({ error: 'Erro ao deletar evento.', details: err.message });
    }
  }
};

module.exports = AgendaEventoController;

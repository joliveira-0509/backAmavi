const AgendaEventoModel = require('../models/agendaEventoModel');

const AgendaEventoController = {
  cadastrar: async (req, res) => {
    try {
      const evento = req.body;
      // Removido tratamento de foto_url/imagem
      const result = await AgendaEventoModel.cadastrar(evento);
      return res.status(201).json({
        message: 'Evento cadastrado com sucesso!',
        id: result.insertId
      });
    } catch (err) {
      console.error('Erro ao cadastrar evento:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar evento.', details: err.message });
    }
  },

  listarTodos: async (req, res) => {
    try {
      const eventos = await AgendaEventoModel.listarTodos();
      return res.status(200).json(eventos);
    } catch (err) {
      console.error('Erro ao listar eventos:', err);
      return res.status(500).json({ error: 'Erro ao listar eventos.', details: err.message });
    }
  },

  listarPorTipo: async (req, res) => {
    try {
      const { tipo } = req.params;
      const eventos = await AgendaEventoModel.listarPorTipo(tipo);

      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Nenhum evento encontrado com esse tipo.' });
      }

      return res.status(200).json(eventos);
    } catch (err) {
      console.error('Erro ao buscar eventos por tipo:', err);
      return res.status(500).json({ error: 'Erro ao buscar eventos por tipo.', details: err.message });
    }
  },

  editar: async (req, res) => {
    try {
      const { id } = req.params;
      const evento = req.body;

      await AgendaEventoModel.editar(id, evento);

      return res.status(200).json({ message: 'Evento atualizado com sucesso!' });
    } catch (err) {
      console.error('Erro ao editar evento:', err);
      return res.status(500).json({ error: 'Erro ao editar evento.', details: err.message });
    }
  },

  deletar: async (req, res) => {
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

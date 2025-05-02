const HistoricoAtendimentoModel = require('../models/historicoAtendimentoModel');

const HistoricoAtendimentoController = {
  buscarPorUsuario: async (req, res) => {
    try {
      const { id_usuario } = req.params;
      const resultados = await HistoricoAtendimentoModel.buscarPorUsuario(id_usuario);
      res.status(200).json(resultados);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      res.status(500).json({ error: 'Erro ao buscar histórico.', details: err.message });
    }
  }
};

module.exports = HistoricoAtendimentoController;

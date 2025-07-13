const AcessosModel = require('../models/acessosModel');

const AcessosController = {
  // Registra o acesso do usuário capturando o IP
  async registrarAcesso(req, res) {
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'desconhecido';
      await AcessosModel.registrar(ip);
      res.status(200).json({ message: 'Acesso registrado com sucesso!', ip });
    } catch (err) {
      console.error('Erro ao registrar acesso:', err);
      res.status(500).json({ error: 'Erro ao registrar acesso.' });
    }
  }
};

module.exports = AcessosController;
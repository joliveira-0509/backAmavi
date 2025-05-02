const express = require('express');
const router = express.Router();
const HistoricoAtendimentoController = require('../controllers/historicoAtendimentoController');

// GET /api/historico/atendimento/:id_usuario
router.get('/atendimento/:id_usuario', HistoricoAtendimentoController.buscarPorUsuario);

module.exports = router;

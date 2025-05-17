const express = require('express');
const router = express.Router();
const HistoricoAtendimentoController = require('../controllers/historicoAtendimentoController');

// GET /api/historico/atendimento/:id_usuario
router.get('/atendimento/:id_usuario', HistoricoAtendimentoController.buscarPorUsuario);

// GET /api/historico/atendimento
router.get('/atendimento', HistoricoAtendimentoController.buscarTodos);

// POST /api/historico/atendimento
router.post('/atendimento', HistoricoAtendimentoController.adicionarAtendimento);

// GET /api/historico/atendimento/:id
router.get('/atendimento/:id', HistoricoAtendimentoController.buscarPorId);

// PUT /api/historico/atendimento/:id
router.put('/atendimento/:id', HistoricoAtendimentoController.atualizarAtendimento);

// DELETE /api/historico/atendimento/:id
router.delete('/atendimento/:id', HistoricoAtendimentoController.excluirAtendimento);

module.exports = router;
const express = require('express');
const router = express.Router();
const HistoricoAtendimentoController = require('../controllers/historicoAtendimentoController');
const { autenticarToken } = require('../controllers/loginController'); // <-- Adicione aqui

// GET /api/historico/atendimento/:id_usuario
router.get('/atendimento/:id_usuario', autenticarToken, HistoricoAtendimentoController.buscarPorUsuario);

// GET /api/historico/atendimento
router.get('/atendimento', autenticarToken, HistoricoAtendimentoController.buscarTodos);

// POST /api/historico/atendimento
router.post('/atendimento', autenticarToken, HistoricoAtendimentoController.adicionarAtendimento);

// GET /api/historico/atendimento/:id
router.get('/atendimento/:id', autenticarToken, HistoricoAtendimentoController.buscarPorId);

// PUT /api/historico/atendimento/:id
router.put('/atendimento/:id', autenticarToken, HistoricoAtendimentoController.atualizarAtendimento);

// DELETE /api/historico/atendimento/:id
router.delete('/atendimento/:id', autenticarToken, HistoricoAtendimentoController.excluirAtendimento);

module.exports = router;
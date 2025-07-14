const express = require('express');
const router = express.Router();
const SolicitacaoAtendimentoController = require('../controllers/solicitacaoAtendimentoController');

// Criar uma nova solicitação (requerimento)
router.post('/solicitacao', SolicitacaoAtendimentoController.cadastrar);

// Listar todas as solicitações
router.get('/solicitacao', SolicitacaoAtendimentoController.listarTodas);

// Buscar solicitação por ID
router.get('/solicitacao/:id', SolicitacaoAtendimentoController.buscarPorId);

// Buscar solicitações por usuário
router.get('/solicitacao/usuario/:id_usuario', SolicitacaoAtendimentoController.buscarPorUsuario);

// Editar uma solicitação
router.put('/solicitacao/:id', SolicitacaoAtendimentoController.editar);

// Deletar uma solicitação
router.delete('/solicitacao/:id', SolicitacaoAtendimentoController.deletar);

module.exports = router;
const express = require('express');
const router = express.Router();
const SolicitacaoAtendimentoController = require('../controllers/solicitacaoAtendimentoController');
const { autenticarToken } = require('../controllers/loginController'); // <-- Adicione aqui

// Criar uma nova solicitação (requerimento)
router.post('/solicitacao', autenticarToken, SolicitacaoAtendimentoController.cadastrar);

// Listar todas as solicitações
router.get('/solicitacao', autenticarToken, SolicitacaoAtendimentoController.listarTodas);

// Buscar solicitação por ID
router.get('/solicitacao/:id', autenticarToken, SolicitacaoAtendimentoController.buscarPorId);

// Buscar solicitações por usuário
router.get('/solicitacao/usuario/:id_usuario', autenticarToken, SolicitacaoAtendimentoController.buscarPorUsuario);

// Editar uma solicitação
router.put('/solicitacao/:id', autenticarToken, SolicitacaoAtendimentoController.editar);

// Deletar uma solicitação
router.delete('/solicitacao/:id', autenticarToken, SolicitacaoAtendimentoController.deletar);

module.exports = router;

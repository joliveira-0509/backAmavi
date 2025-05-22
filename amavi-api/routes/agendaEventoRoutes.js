const express = require('express');
const eventoController = require('../controllers/eventoController');
const { autenticarToken } = require('../controllers/loginController'); // <-- Adicione aqui
const router = express.Router();

// Listar todos eventos
router.get('/eventos', autenticarToken, eventoController.listarEventos);

// Buscar evento por ID
router.get('/eventos/:id', autenticarToken, eventoController.buscarEventoPorId);

// Cadastrar evento
router.post('/eventos', autenticarToken, eventoController.cadastrarEvento);

// Atualizar evento inteiro
router.put('/eventos/:id', autenticarToken, eventoController.atualizarEvento);

// Atualizar parcialmente
router.patch('/eventos/:id', autenticarToken, eventoController.atualizarParcialEvento);

// Deletar evento
router.delete('/eventos/:id', autenticarToken, eventoController.deletarEvento);

module.exports = router;

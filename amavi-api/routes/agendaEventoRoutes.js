const express = require('express');
const eventoController = require('../controllers/eventoController');
const router = express.Router();

// Listar todos eventos
router.get('/eventos', eventoController.listarEventos);

// Buscar evento por ID
router.get('/eventos/:id', eventoController.buscarEventoPorId);

// Cadastrar evento
router.post('/eventos', eventoController.cadastrarEvento);

// Atualizar evento inteiro
router.put('/eventos/:id', eventoController.atualizarEvento);

// Atualizar parcialmente
router.patch('/eventos/:id', eventoController.atualizarParcialEvento);

// Deletar evento
router.delete('/eventos/:id', eventoController.deletarEvento);

module.exports = router;

const express = require('express');
const eventoController = require('../controllers/eventoController');
const router = express.Router();

// Rota para cadastrar evento
router.post('/eventos', eventoController.cadastrarEvento);

// Rota para atualizar evento
router.put('/eventos', eventoController.atualizarEvento);

module.exports = router;

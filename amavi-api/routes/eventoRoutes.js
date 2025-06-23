const express = require('express');
const eventoController = require('../controllers/eventoController');
const router = express.Router();

// Rota para cadastrar evento
router.post('api/evento', eventoController.cadastrarEvento);

// Rota para atualizar evento
router.put('api/evento', eventoController.atualizarEvento);

module.exports = router;

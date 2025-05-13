const express = require('express');
const { atualizarEvento } = require('../controllers/eventoController');
const router = express.Router();
// Rota para atualizar evento
router.put('/eventos', atualizarEvento); // Mudamos para '/eventos'
module.exports = router;
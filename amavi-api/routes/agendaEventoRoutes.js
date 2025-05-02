// routes/agendaRoutes.js
const express = require('express');
const router = express.Router();
const AgendaEventoController = require('../controllers/agendaEventoController');

// Essas rotas agora são relativas a /api/agenda
router.post('/', AgendaEventoController.cadastrar);
router.get('/', AgendaEventoController.listarTodos);
router.get('/tipo/:tipo', AgendaEventoController.listarPorTipo);
router.put('/:id', AgendaEventoController.editar);
router.delete('/:id', AgendaEventoController.deletar);

module.exports = router;

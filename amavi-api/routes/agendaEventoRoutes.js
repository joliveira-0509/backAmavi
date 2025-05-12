// routes/agendaRoutes.js
const express = require('express');
const AgendaEventoController = require('../controllers/agendaEventoController.js');

const router = express.Router();

// Essas rotas agora são relativas a /api/agenda
router.post('/', AgendaEventoController.cadastrar);
router.get('/', AgendaEventoController.listarTodos);
router.get('/tipo/:tipo', AgendaEventoController.listarPorTipo);
router.put('/:id', AgendaEventoController.editar);
router.delete('/:id', AgendaEventoController.deletar);

module.exports = router;

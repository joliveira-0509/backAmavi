const express = require('express');
const router = express.Router();
const DocumentacaoController = require('../controllers/documentacaoController');

// POST /api/documentacao
router.post('/', DocumentacaoController.cadastrar);

// GET /api/documentacao
router.get('/', DocumentacaoController.listarTodas);

// GET /api/documentacao/:id
router.get('/:id', DocumentacaoController.buscarPorId);

// GET /api/documentacao/usuario/:id_usuario
router.get('/usuario/:id_usuario', DocumentacaoController.buscarPorUsuario);

// PUT /api/documentacao/:id
router.put('/:id', DocumentacaoController.editar);

// DELETE /api/documentacao/:id
router.delete('/:id', DocumentacaoController.deletar);

module.exports = router;

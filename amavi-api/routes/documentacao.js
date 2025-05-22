const express = require('express');
const router = express.Router();
const DocumentacaoController = require('../controllers/documentacaoController');
const { autenticarToken } = require('../controllers/loginController'); // <-- Adicione aqui

// POST /api/documentacao
router.post('/', autenticarToken, DocumentacaoController.cadastrar);

// GET /api/documentacao
router.get('/', autenticarToken, DocumentacaoController.listarTodas);

// GET /api/documentacao/:id
router.get('/:id', autenticarToken, DocumentacaoController.buscarPorId);

// GET /api/documentacao/usuario/:id_usuario
router.get('/usuario/:id_usuario', autenticarToken, DocumentacaoController.buscarPorUsuario);

// PUT /api/documentacao/:id
router.put('/:id', autenticarToken, DocumentacaoController.editar);

// DELETE /api/documentacao/:id
router.delete('/:id', autenticarToken, DocumentacaoController.deletar);

module.exports = router;

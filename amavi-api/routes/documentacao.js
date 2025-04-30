const express = require('express');
const router = express.Router();
const DocumentacaoController = require('../controllers/documentacaoController');

// Rota para cadastrar um novo documento
router.post('/cadastrar', DocumentacaoController.cadastrarDocumento);

module.exports = router;
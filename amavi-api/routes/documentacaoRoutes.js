const express = require('express');
const router = express.Router();
const DocumentacaoController = require('../controllers/documentacaoController');


router.post('/cadastrar', DocumentacaoController.cadastrarDocumento);

module.exports = router;
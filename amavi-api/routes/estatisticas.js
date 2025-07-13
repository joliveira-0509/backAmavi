const express = require('express');
const router = express.Router();
const AcessosController = require('../controllers/acessosController');

// Rota GET para registrar acesso
router.get('/registrar-acesso', AcessosController.registrarAcesso);

module.exports = router;
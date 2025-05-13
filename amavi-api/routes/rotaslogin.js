const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Rota para login de usuário
router.post('/login', loginController.login);

// Rota para logout
router.post('/logout', loginController.logout);

// Rota para atualizar senha
router.put('/atualizarsenha', loginController.atualizarSenha);

// Rota para cadastro de administrador
router.post('/cadastrar-adm', loginController.cadastrarAdm);

module.exports = router;

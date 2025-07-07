const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Rota para login de usuário
router.post('/login', loginController.login);

// Rota para logout
router.post('/logout', loginController.logout);

// Rota para atualizar senha (protegida)
router.put('/atualizarsenha', loginController.autenticarToken, loginController.atualizarSenha);

// Rota para cadastro de administrador
router.post('/cadastrar-adm', loginController.cadastrarAdm);

// Rota para deletar administrador (protegida e restrita a Adm)
router.delete('/deletar-adm/:cpf', loginController.autenticarToken, loginController.somenteAdmin, loginController.deletarAdm);

// Rota para verificar login (protegida)
router.get('/verificar-login', loginController.autenticarToken, loginController.verificarLogin);

module.exports = router;

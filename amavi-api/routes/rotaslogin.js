const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/loginController'); // Ajuste o caminho conforme necessário
// Rota para login
router.post('/login', login);
// Rota para logout
router.post('/logout', logout);
module.exports = router;
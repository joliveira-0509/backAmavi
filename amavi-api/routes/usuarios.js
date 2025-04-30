const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

router.get('/', UsuariosController.getUsuarios);
router.post('/', UsuariosController.createUsuario);

// Rota para cadastrar um novo usuário
router.post('/cadastrar', UsuariosController.cadastrarUsuario);

module.exports = router;

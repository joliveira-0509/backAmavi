const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

// Certifique-se de que essas funções estão corretamente definidas no controller
router.post('/cadastrar', UsuariosController.cadastrarUsuario);
router.get('/buscar', UsuariosController.buscarUsuariosPorNome);
router.delete('/:id', UsuariosController.deletarUsuario);

module.exports = router;

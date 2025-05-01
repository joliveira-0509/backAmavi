const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');

router.post('/usuarios', UsuariosController.cadastrarUsuario);
router.get('/usuarios', UsuariosController.buscarUsuariosPorNome);
router.delete('/usuarios/:id', UsuariosController.deletarUsuario);

module.exports = router;

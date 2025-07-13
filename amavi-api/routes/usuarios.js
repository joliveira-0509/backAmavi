const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const db = require('../db/db');
const { autenticarToken } = require('../controllers/loginController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de múltiplos arquivos (foto e laudo médico)
const upload = multer();

const multiUpload = upload.fields([
    { name: 'foto_blob', maxCount: 1 },
    { name: 'laudo_medico', maxCount: 1 }
]);

// Cadastro de usuário com foto e laudo médico
router.post('/Usuarios', multiUpload, UsuariosController.cadastrarUsuario);

router.get('/Usuarios', autenticarToken, UsuariosController.buscarUsuariosPorNome);
router.delete('/Usuarios/:id', autenticarToken, validarId, UsuariosController.deletarUsuario);
router.get('/Usuarios/todos', autenticarToken, UsuariosController.buscarTodosUsuarios);
router.put('/atualizar/:id', autenticarToken, validarId, UsuariosController.atualizarUsuario);
router.patch('/atualizar/:id', autenticarToken, validarId, UsuariosController.atualizarUsuarioParcial);
router.post('/Usuarios/:id/foto', autenticarToken, validarId, upload.single('foto'), UsuariosController.uploadFotoUsuario);
router.get('/Usuarios/:id', autenticarToken, validarId, UsuariosController.buscarPorId);

module.exports = router;

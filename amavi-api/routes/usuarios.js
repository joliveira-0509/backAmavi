const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const db = require('../db/db');
const { autenticarToken } = require('../controllers/loginController');
const multer = require('multer');

// Configuração do Multer para upload de múltiplos arquivos (foto e laudo médico)
const upload = multer();
const multiUpload = upload.fields([
    { name: 'foto_blob', maxCount: 1 },
    { name: 'laudo_medico', maxCount: 1 }
]);

// Cadastro de usuário com foto e laudo médico
router.post('/Usuarios', multiUpload, UsuariosController.cadastrarUsuario);

// Buscar usuários (por nome ou todos)
router.get('/Usuarios', autenticarToken, UsuariosController.buscarUsuariosPorNome);
router.get('/Usuarios/todos', UsuariosController.buscarTodosUsuarios);

// Buscar, atualizar e deletar por ID
router.get('/Usuarios/:id', autenticarToken, UsuariosController.buscarPorId);
router.put('/atualizar/:id', autenticarToken, UsuariosController.atualizarUsuario);
router.patch('/atualizar/:id', autenticarToken, UsuariosController.atualizarUsuarioParcial);
router.delete('/Usuarios/:id', autenticarToken, UsuariosController.deletarUsuario);

// Upload de foto de perfil
router.post('/Usuarios/:id/foto', autenticarToken, upload.single('foto'), UsuariosController.uploadFotoUsuario);

module.exports = router;

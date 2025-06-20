const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const db = require('../db/db');
const { autenticarToken } = require('../controllers/loginController');
const multer = require('multer');
const path = require('path');

// Configuração do Multer para upload de imagens em memória
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens JPEG ou PNG são permitidas!'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

function validarId(req, res, next) {
    const { id } = req.params;
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
    }
    next();
}

router.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).json({ message: 'Conexão com o banco de dados está funcionando.' });
    } catch (err) {
        console.error('Erro ao verificar conexão com o banco de dados:', err);
        res.status(500).json({ error: 'Erro ao conectar ao banco de dados.' });
    }
});

router.post('/Usuarios', upload.single('foto'), UsuariosController.cadastrarUsuario);
router.get('/Usuarios', autenticarToken, UsuariosController.buscarUsuariosPorNome);
router.delete('/Usuarios/:id', autenticarToken, validarId, UsuariosController.deletarUsuario);
router.get('/Usuarios/todos', autenticarToken, UsuariosController.buscarTodosUsuarios);
router.put('/atualizar/:id', autenticarToken, validarId, UsuariosController.atualizarUsuario);
router.patch('/atualizar/:id', autenticarToken, validarId, UsuariosController.atualizarUsuarioParcial);
router.post('/Usuarios/:id/foto', autenticarToken, validarId, upload.single('foto'), UsuariosController.uploadFotoUsuario);

module.exports = router;
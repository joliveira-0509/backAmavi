const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const db = require('../db/db'); 
const { autenticarToken } = require('../controllers/loginController'); // <-- Adicione aqui

function validarId(req, res, next) {
    const { id } = req.params;
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
    }
    next();
}

router.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1'); // Executa uma consulta simples para verificar a conexão
        res.status(200).json({ message: 'Conexão com o banco de dados está funcionando.' });
    } catch (err) {
        console.error('Erro ao verificar conexão com o banco de dados:', err);
        res.status(500).json({ error: 'Erro ao conectar ao banco de dados.' });
    }
});

router.post('/Usuarios', UsuariosController.cadastrarUsuario);
router.get('/Usuarios', autenticarToken, UsuariosController.buscarUsuariosPorNome);
router.delete('/Usuarios/:id', autenticarToken, validarId, UsuariosController.deletarUsuario);
router.get('/Usuarios/todos', autenticarToken, UsuariosController.buscarTodosUsuarios);
router.put('/atualizar/:id', autenticarToken, validarId, UsuariosController.atualizarUsuario);
router.patch('/atualizar/:id', autenticarToken, validarId, UsuariosController.atualizarUsuarioParcial);

module.exports = router;

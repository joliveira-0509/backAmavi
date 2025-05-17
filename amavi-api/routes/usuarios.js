const express = require('express');
const router = express.Router();
const UsuariosController = require('../controllers/usuariosController');
const db = require('../db/db'); 

function validarId(req, res, next) {
    const { id } = req.params;
    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido.' });
    }
    next();
}

// Rota para verificar a conexão com o banco de dados
router.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1'); // Executa uma consulta simples para verificar a conexão
        res.status(200).json({ message: 'Conexão com o banco de dados está funcionando.' });
    } catch (err) {
        console.error('Erro ao verificar conexão com o banco de dados:', err);
        res.status(500).json({ error: 'Erro ao conectar ao banco de dados.' });
    }
});

router.post('/usuarios', UsuariosController.cadastrarUsuario);
router.get('/usuarios', UsuariosController.buscarUsuariosPorNome);
router.delete('/usuarios/:id', validarId, UsuariosController.deletarUsuario);
router.get('/usuarios/todos', UsuariosController.buscarTodosUsuarios);
module.exports = router;

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

/**
 * @swagger
 * /api/usuarios/health:
 *   get:
 *     summary: Verifica a conexão com o banco de dados
 *     description: Realiza uma consulta simples para verificar se a conexão com o banco está funcionando.
 *     responses:
 *       200:
 *         description: Conexão com o banco de dados está funcionando.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Conexão com o banco de dados está funcionando.
 *       500:
 *         description: Erro ao conectar ao banco de dados.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao conectar ao banco de dados.
 */
router.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).json({ message: 'Conexão com o banco de dados está funcionando.' });
    } catch (err) {
        console.error('Erro ao verificar conexão com o banco de dados:', err);
        res.status(500).json({ error: 'Erro ao conectar ao banco de dados.' });
    }
});

/**
 * @swagger
 * /api/usuarios/cadastrar:
 *   post:
 *     summary: Cadastrar um novo usuário
 *     description: Cadastra um usuário com as informações enviadas no corpo da requisição.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@email.com
 *               senha:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso.
 *       400:
 *         description: Dados inválidos.
 */
router.post('/cadastrar', UsuariosController.cadastrarUsuario);

/**
 * @swagger
 * /api/usuarios/busca:
 *   get:
 *     summary: Buscar usuários por nome
 *     description: Busca usuários que contenham o parâmetro de consulta "nome" na base de dados.
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema:
 *           type: string
 *         required: true
 *         description: Nome ou parte do nome do usuário a ser buscado.
 *     responses:
 *       200:
 *         description: Lista de usuários encontrados.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       400:
 *         description: Parâmetro "nome" não informado.
 */
router.get('/busca', UsuariosController.buscarUsuariosPorNome);

/**
 * @swagger
 * /api/usuarios/busca/{id}:
 *   delete:
 *     summary: Deletar usuário por ID
 *     description: Deleta um usuário específico pelo seu ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário a ser deletado.
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *       400:
 *         description: ID inválido.
 *       404:
 *         description: Usuário não encontrado.
 */
router.delete('/busca/:id', validarId, UsuariosController.deletarUsuario);

/**
 * @swagger
 * /api/usuarios/buscatodos:
 *   get:
 *     summary: Buscar todos os usuários
 *     description: Retorna a lista completa de usuários cadastrados.
 *     responses:
 *       200:
 *         description: Lista de todos os usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/buscatodos', UsuariosController.buscarTodosUsuarios);

/**
 * @swagger
 * /api/usuarios/atualizar/{id}:
 *   put:
 *     summary: Atualizar usuário por ID
 *     description: Atualiza os dados completos de um usuário específico pelo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva Atualizado
 *               email:
 *                 type: string
 *                 example: joaoatualizado@email.com
 *               senha:
 *                 type: string
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       400:
 *         description: ID inválido ou dados inválidos.
 *       404:
 *         description: Usuário não encontrado.
 */
router.put('/atualizar/:id', validarId, UsuariosController.atualizarUsuario);

/**
 * @swagger
 * /api/usuarios/atualizar/{id}:
 *   patch:
 *     summary: Atualizar parcialmente usuário por ID
 *     description: Atualiza parcialmente os dados de um usuário específico pelo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do usuário a ser atualizado parcialmente.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Campos que podem ser atualizados parcialmente
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Silva Parcial
 *               email:
 *                 type: string
 *                 example: joaoparcial@email.com
 *     responses:
 *       200:
 *         description: Usuário atualizado parcialmente com sucesso.
 *       400:
 *         description: ID inválido ou dados inválidos.
 *       404:
 *         description: Usuário não encontrado.
 */
router.patch('/atualizar/:id', validarId, UsuariosController.atualizarUsuarioParcial);

module.exports = router;

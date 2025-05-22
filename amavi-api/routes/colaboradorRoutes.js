const express = require('express');
const {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador
} = require('../controllers/colaboradorController.js');
const { autenticarToken } = require('../controllers/loginController'); // <-- Adicione aqui

const router = express.Router();

router.get('/colaboradores', autenticarToken, listarColaboradores);
router.get('/colaboradores/:id', autenticarToken, buscarColaboradorPorId);
router.post('/colaboradores', autenticarToken, cadastrarColaborador);
router.put('/colaboradores/:id', autenticarToken, atualizarColaborador);
router.patch('/colaboradores/:id', autenticarToken, editarParcialColaborador);
router.delete('/colaboradores/:id', autenticarToken, deletarColaborador);

module.exports = router;

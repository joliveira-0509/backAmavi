const express = require('express');
const {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador
} = require('../controllers/colaboradorController.js');

const router = express.Router();

router.get('/colaboradores', listarColaboradores);
router.get('/colaboradores/:id', buscarColaboradorPorId);
router.post('/colaboradores', cadastrarColaborador);
router.put('/colaboradores/:id', atualizarColaborador);
router.patch('/colaboradores/:id', editarParcialColaborador);
router.delete('/colaboradores/:id', deletarColaborador);

module.exports = router;

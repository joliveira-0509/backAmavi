import express from 'express';
import {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador
} from '../controllers/colaboradorController.js';

const router = express.Router();

router.get('/colaboradores', listarColaboradores);
router.get('/colaboradores/:id', buscarColaboradorPorId);
router.post('/colaboradores', cadastrarColaborador);
router.put('/colaboradores/:id', atualizarColaborador);
router.patch('/colaboradores/:id', editarParcialColaborador);
router.delete('/colaboradores/:id', deletarColaborador);

export default router;
 
import express from 'express';
import { cadastrarRequerimento } from '../controllers/requerimentosController.js';

const router = express.Router();

router.post('/', cadastrarRequerimento);

export default router;

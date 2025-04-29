import express from 'express';
import { cadastrarEvento } from '../controllers/eventoController.js';

const router = express.Router();

router.post('/', cadastrarEvento);

export default router;

import express from 'express';
import { cadastrarDocumento } from '../controllers/documentosController.js';

const router = express.Router();

router.post('/', cadastrarDocumento);

export default router;

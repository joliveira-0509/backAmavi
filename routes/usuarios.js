import { Router } from 'express';
import upload from '../middlewares/upload.js';
import { cadastrarUsuario } from '../controllers/usuariosController.js';

const router = Router();


router.post('/usuarios', upload.single('foto'), cadastrarUsuario);

export default router;

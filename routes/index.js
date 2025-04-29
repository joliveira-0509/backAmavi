import express from 'express';
import documentosRoutes from './documentos.js';
import eventosRoutes from './eventos.js';
import requerimentosRoutes from './requerimentos.js';
import usuariosRoutes from './usuarios.js';

const router = express.Router();

router.use('/documentos', documentosRoutes);
router.use('/eventos', eventosRoutes);
router.use('/requerimentos', requerimentosRoutes);
router.use('/usuarios', usuariosRoutes);

export default router;

const express = require('express');
const eventoController = require('../controllers/eventoController');
const multer = require('multer');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', eventoController.listarEventos);
router.get('/tipo/:tipo_evento', eventoController.listarEventosPorTipo);
router.get('/:id', eventoController.buscarEventoPorId);
router.post('/', upload.single('imagem'), eventoController.cadastrarEvento);
router.put('/:id', upload.single('imagem'), eventoController.atualizarEvento);
router.patch('/:id', upload.single('imagem'), eventoController.atualizarParcialEvento);
router.delete('/:id', eventoController.deletarEvento);

module.exports = router;

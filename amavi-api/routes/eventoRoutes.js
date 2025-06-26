const express = require('express');
const eventoController = require('../controllers/eventoController');
const multer = require('multer');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Rota para cadastrar evento
router.post('/', upload.single('imagem'), eventoController.cadastrarEvento);

// Rota para atualizar evento
router.put('/:id', upload.single('imagem'), eventoController.atualizarEvento);

module.exports = router;
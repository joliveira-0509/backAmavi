const express = require('express');
const multer = require('multer');
const DocumentacaoController = require('../controllers/documentacaoController');

// Multer - armazenamento em memória para pegar buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limite
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF, JPEG ou PNG são permitidos!'));
    }
  }
});

const router = express.Router();

router.post('/documentos', upload.single('documento'), DocumentacaoController.cadastrar);
router.get('/documentos', DocumentacaoController.listarTodas);
router.get('/documentos/:id', DocumentacaoController.buscarPorId);
router.get('/documentos/arquivo/:id', DocumentacaoController.buscarArquivo);
router.get('/documentos/usuario/:id_usuario', DocumentacaoController.buscarPorUsuario);
router.put('/documentos/:id', upload.single('documento'), DocumentacaoController.editar);
router.delete('/documentos/:id', DocumentacaoController.deletar);

module.exports = router;

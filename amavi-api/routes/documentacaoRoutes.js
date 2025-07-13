const express = require('express');
const multer = require('multer');
const {
  cadastrar,
  listarTodas,
  buscarPorId,
  buscarArquivo,
  buscarPorUsuario,
  editar,
  deletar
} = require('../controllers/documentacaoController');

// Configuração do Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Apenas arquivos PDF, DOC ou DOCX são permitidos!'));
  }
});

const router = express.Router();

router.post('/documentos', upload.single('documento'), cadastrar);
router.get('/documentos', listarTodas);
router.get('/documentos/:id', buscarPorId);
router.get('/documentos/arquivo/:id', buscarArquivo);
router.get('/documentos/usuario/:id_usuario', buscarPorUsuario);
router.put('/documentos/:id', upload.single('documento'), editar);
router.delete('/documentos/:id', deletar);

module.exports = router;
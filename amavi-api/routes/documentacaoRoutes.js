const express = require('express');
const multer = require('multer');
const {
  cadastrarDocumento,
  listarDocumentos,
  buscarDocumentoPorId,
  buscarDocumentosPorUsuario,
  atualizarDocumento,
  editarParcialDocumento,
  deletarDocumento
} = require('../controllers/documentacaoController');
const { autenticarToken } = require('../controllers/loginController');

// Configure Multer para armazenar arquivos na memória (já que serão salvos no DB como LONGBLOB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB para documentos
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

router.post('/documentos', autenticarToken, upload.single('documento'), cadastrarDocumento);
router.get('/documentos', autenticarToken, listarDocumentos);
router.get('/documentos/:id', autenticarToken, buscarDocumentoPorId);
router.get('/documentos/usuario/:id_usuario', autenticarToken, buscarDocumentosPorUsuario);
router.put('/documentos/:id', autenticarToken, upload.single('documento'), atualizarDocumento);
router.patch('/documentos/:id', autenticarToken, upload.single('documento'), editarParcialDocumento);
router.delete('/documentos/:id', autenticarToken, deletarDocumento);

module.exports = router;
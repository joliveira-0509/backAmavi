const express = require('express');
const multer = require('multer');
const DocumentacaoController = require('../controllers/documentacaoController');

const router = express.Router();

// Configuração do Multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/documentacao (com upload de arquivo)
router.post('/', upload.single('arquivo'), DocumentacaoController.cadastrar);

// GET /api/documentacao
router.get('/', DocumentacaoController.listarTodas);

// GET /api/documentacao/:id
router.get('/:id', DocumentacaoController.buscarPorId);

// GET /api/documentacao/arquivo/:id (pegar binário do arquivo)
router.get('/arquivo/:id', DocumentacaoController.buscarArquivo);

// GET /api/documentacao/usuario/:id_usuario
router.get('/usuario/:id_usuario', DocumentacaoController.buscarPorUsuario);

// PUT /api/documentacao/:id (com novo arquivo opcional)
router.put('/:id', upload.single('arquivo'), DocumentacaoController.editar);

// DELETE /api/documentacao/:id
router.delete('/:id', DocumentacaoController.deletar);

module.exports = router;
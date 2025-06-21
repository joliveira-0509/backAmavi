const express = require('express');
const multer = require('multer');
const {
  cadastrarEvento,
  listarEventos,
  buscarEventoPorId,
  listarEventosPorTipo,
  atualizarEvento,
  atualizarParcialEvento,
  deletarEvento
} = require('../controllers/eventoController');
const { autenticarToken } = require('../controllers/loginController');

// Configure Multer para armazenar arquivos na memória
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens JPEG ou PNG são permitidas!'));
  }
});

const router = express.Router();

// Listar todos os eventos
router.get('/api/evento', autenticarToken, listarEventos);
// Listar eventos por tipo
router.get('/api/evento/tipo/:tipo_evento', autenticarToken, listarEventosPorTipo);
// Buscar evento por ID
router.get('/api/evento/:id', autenticarToken, buscarEventoPorId);
// Cadastrar evento
router.post('/api/evento', autenticarToken, upload.single('imagem'), cadastrarEvento);
// Atualizar evento (completo)
router.put('/api/evento/:id', autenticarToken, upload.single('imagem'), atualizarEvento);
// Atualizar evento parcialmente
router.patch('/api/evento/:id', autenticarToken, upload.single('imagem'), atualizarParcialEvento);
// Deletar evento
router.delete('/api/evento/:id', autenticarToken, deletarEvento);

module.exports = router;
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

// Configure Multer para armazenar arquivos na memória (já que serão salvos no DB como LONGBLOB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 5MB para imagens
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
router.get('/eventos', autenticarToken, listarEventos);
// Listar eventos por tipo
router.get('/eventos/tipo/:tipo_evento', autenticarToken, listarEventosPorTipo);
// Buscar evento por ID
router.get('/eventos/:id', autenticarToken, buscarEventoPorId);
// Cadastrar evento
router.post('/eventos', autenticarToken, upload.single('imagem'), cadastrarEvento);
// Atualizar evento (completo)
router.put('/eventos/:id', autenticarToken, upload.single('imagem'), atualizarEvento);
// Atualizar evento parcialmente
router.patch('/eventos/:id', autenticarToken, upload.single('imagem'), atualizarParcialEvento);
// Deletar evento
router.delete('/eventos/:id', autenticarToken, deletarEvento);

module.exports = router;


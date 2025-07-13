const express = require('express');
const multer = require('multer'); // Import Multer
const {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador
} = require('../controllers/colaboradorController.js');
const { autenticarToken } = require('../controllers/loginController');

// Configure Multer to store files in memory (since we'll store in DB as LONGBLOB)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
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

// Removido autenticarToken das rotas de busca e cadastro
router.get('/colaboradores', listarColaboradores);
router.get('/colaboradores/:id', buscarColaboradorPorId);
router.post('/colaboradores', upload.single('foto_url'), cadastrarColaborador);

// Mantém autenticação para atualização, edição parcial e exclusão
router.put('/colaboradores/:id', autenticarToken, upload.single('foto_url'), atualizarColaborador);
router.patch('/colaboradores/:id', autenticarToken, upload.single('foto_url'), editarParcialColaborador);
router.delete('/colaboradores/:id', autenticarToken, deletarColaborador);

module.exports = router;
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

router.get('/colaboradores', autenticarToken, listarColaboradores);
router.get('/colaboradores/:id', autenticarToken, buscarColaboradorPorId);
router.post('/colaboradores', autenticarToken, upload.single('imagem'), cadastrarColaborador);
router.put('/colaboradores/:id', autenticarToken, upload.single('imagem'), atualizarColaborador);
router.patch('/colaboradores/:id', autenticarToken, upload.single('imagem'), editarParcialColaborador);
router.delete('/colaboradores/:id', autenticarToken, deletarColaborador);

module.exports = router;
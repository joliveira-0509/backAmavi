const express = require('express');
const multer = require('multer');
const { uploadFotoUsuario } = require('../controllers/fotoUsuarioController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Rota: PATCH /api/usuarios/:id/foto
router.patch('/usuarios/:id/foto', upload.single('foto'), uploadFotoUsuario);

module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuariosController');

router.get('/', controller.getUsuarios);
router.post('/', controller.createUsuario);

module.exports = router;

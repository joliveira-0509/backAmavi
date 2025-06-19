const UsuariosModel = require('../models/usuariosModel');

const uploadFotoUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const fotoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const result = await UsuariosModel.atualizarFoto(id, fotoUrl);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ message: 'Foto atualizada com sucesso!', foto_url: fotoUrl });
  } catch (error) {
    console.error('Erro ao atualizar foto do usuário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar foto do usuário.' });
  }
};

module.exports = { uploadFotoUsuario };
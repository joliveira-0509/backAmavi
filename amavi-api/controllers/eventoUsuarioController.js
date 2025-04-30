const UsuariosModel = require('../models/usuariosModel');

const EventoUsuarioController = {
    listarTotaisPorTipo: (req, res) => {
        UsuariosModel.contarEventos((err, results) => {
            if (err) {
                console.error('Erro ao contar eventos:', err);
                return res.status(500).json({ error: 'Erro ao contar eventos.' });
            }

            res.status(200).json(results);
        });
    }
};

module.exports = EventoUsuarioController;

const express = require('express');
const app = express();
const db = require('./db');


app.use(express.json());



app.put('/eventos/:id', async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url } = req.body;

  try {
    const [resultado] = await db.execute(
      `UPDATE agendaeventos SET
        titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?,
        horario_evento = ?, publico = ?, foto_url = ?
      WHERE id = ?`,
      [titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }

    res.json({ mensagem: 'Evento atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar evento' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

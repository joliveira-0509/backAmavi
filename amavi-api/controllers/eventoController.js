const db = require('../db/db');
async function atualizarEvento(req, res) {
  const { id } = req.query; // ID a partir dos parâmetros de consulta
  const { titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url } = req.body;
  // Verifica se o corpo da requisição contém os campos necessários
  if (!titulo || !descricao || !tipo_evento || !data_evento || !horario_evento || !publico || !foto_url) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }
  let query = `UPDATE AgendaEvento SET
    titulo = ?, descricao = ?, tipo_evento = ?, data_evento = ?,
    horario_evento = ?, publico = ?, foto_url = ?`;
  
  let params = [titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url];
  // Adiciona a condição para o ID
  if (id) {
    query += ' WHERE id = ?';
    params.push(id);
  } else {
    return res.status(400).json({ mensagem: 'Por favor, forneça um ID para atualizar o evento.' });
  }
  try {
    const [resultado] = await db.execute(query, params);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }
    res.json({ mensagem: 'Evento atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar evento' });
  }
}
module.exports = { atualizarEvento };
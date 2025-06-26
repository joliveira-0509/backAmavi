const AgendaEventoModel = require('../models/agendaEventoModel');

async function listarEventos(req, res) {
  try {
    const eventos = await AgendaEventoModel.listarTodos();
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({ mensagem: 'Erro ao listar eventos.' });
  }
}

async function listarEventosPorTipo(req, res) {
  const { tipo_evento } = req.params;
  try {
    const eventos = await AgendaEventoModel.listarPorTipo(tipo_evento);
    res.json(eventos);
  } catch (error) {
    console.error('Erro ao listar eventos por tipo:', error);
    res.status(500).json({ mensagem: 'Erro ao listar eventos por tipo.' });
  }
}

async function buscarEventoPorId(req, res) {
  const { id } = req.params;
  try {
    const evento = await AgendaEventoModel.buscarPorId(id);
    if (!evento) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }
    const foto_url = await AgendaEventoModel.buscarImagemPorId(id);
    res.json({ ...evento, foto_url });
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ mensagem: 'Erro ao buscar evento.' });
  }
}

async function cadastrarEvento(req, res) {
  const { titulo, descricao, tipo_evento = 'default', data_evento, horario_evento, publico = 'geral' } = req.body;
  const foto_url = req.file ? `data:image/${req.file.mimetype.split('/')[1]};base64,${req.file.buffer.toString('base64')}` : null;

  if (!titulo || !descricao || !data_evento || !horario_evento) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: título, descrição, data e horário.' });
  }

  try {
    const insertId = await AgendaEventoModel.cadastrar(
      titulo,
      descricao,
      tipo_evento,
      data_evento,
      horario_evento,
      publico,
      foto_url
    );
    res.status(201).json({ mensagem: 'Evento cadastrado com sucesso!', id: insertId });
  } catch (error) {
    console.error('Erro ao cadastrar evento:', error);
    res.status(500).json({ mensagem: 'Erro ao cadastrar evento.' });
  }
}

async function atualizarEvento(req, res) {
  const { id } = req.params;
  const { titulo, descricao, tipo_evento = 'default', data_evento, horario_evento, publico = 'geral' } = req.body;
  const foto_url = req.file ? `data:image/${req.file.mimetype.split('/')[1]};base64,${req.file.buffer.toString('base64')}` : null;

  if (!titulo || !descricao || !data_evento || !horario_evento) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: título, descrição, data e horário.' });
  }

  try {
    await AgendaEventoModel.atualizar(id, titulo, descricao, tipo_evento, data_evento, horario_evento, publico, foto_url);
    res.json({ mensagem: 'Evento atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar evento.' });
  }
}

async function atualizarParcialEvento(req, res) {
  const { id } = req.params;
  const campos = req.body;
  if (req.file) {
    campos.foto_url = `data:image/${req.file.mimetype.split('/')[1]};base64,${req.file.buffer.toString('base64')}`;
  }

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensagem: 'Nenhum campo fornecido para atualização.' });
  }

  try {
    await AgendaEventoModel.atualizarParcial(id, campos);
    res.json({ mensagem: 'Evento atualizado parcialmente com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar parcialmente:', error);
    res.status(500).json({ mensagem: 'Erro ao atualizar evento.' });
  }
}

async function deletarEvento(req, res) {
  const { id } = req.params;
  try {
    await AgendaEventoModel.deletar(id);
    res.json({ mensagem: 'Evento deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ mensagem: 'Erro ao deletar evento.' });
  }
}

module.exports = {
  listarEventos,
  listarEventosPorTipo,
  buscarEventoPorId,
  cadastrarEvento,
  atualizarEvento,
  atualizarParcialEvento,
  deletarEvento,
};
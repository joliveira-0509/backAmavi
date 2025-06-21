const Evento = require('../models/eventoModel');

// Listar todos eventos - GET /eventos
async function listarEventos(req, res) {
  try {
    const eventos = await Evento.findAll();
    res.json(eventos);
  } catch (erro) {
    console.error('Erro ao listar eventos:', erro);
    res.status(500).json({ mensagem: 'Erro ao listar eventos.' });
  }
}

// Buscar evento por ID - GET /eventos/:id
async function buscarEventoPorId(req, res) {
  const { id } = req.params;
  try {
    const evento = await Evento.findById(id);
    if (!evento) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }
    res.json(evento);
  } catch (erro) {
    console.error('Erro ao buscar evento:', erro);
    res.status(500).json({ mensagem: 'Erro ao buscar evento.' });
  }
}

// Cadastrar evento - POST /eventos
async function cadastrarEvento(req, res) {
  try {
    const resultado = await Evento.create(req.body);
    res.status(201).json({
      mensagem: 'Evento cadastrado com sucesso!',
      id: resultado.insertId
    });
  } catch (erro) {
    console.error('Erro ao cadastrar evento:', erro);
    res.status(500).json({ erro: 'Erro ao cadastrar evento.' });
  }
}

// Atualizar evento inteiro - PUT /eventos/:id
async function atualizarEvento(req, res) {
  const { id } = req.params;
  const { titulo, descricao, tipo_evento, data_evento, horario_evento, publico, } = req.body;

  if (!titulo || !descricao || !tipo_evento || !data_evento || !horario_evento || !publico ) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    const resultado = await Evento.update(id, req.body);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }
    res.json({ mensagem: 'Evento atualizado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar evento:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar evento.' });
  }
}

// Atualizar parcialmente - PATCH /eventos/:id
async function atualizarParcialEvento(req, res) {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ mensagem: 'Nenhum campo fornecido para atualização.' });
  }

  try {
    const resultado = await Evento.updatePartial(id, campos);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }
    res.json({ mensagem: 'Evento atualizado parcialmente com sucesso!' });
  } catch (erro) {
    console.error('Erro ao atualizar parcialmente:', erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar evento.' });
  }
}

// Deletar evento - DELETE /eventos/:id
async function deletarEvento(req, res) {
  const { id } = req.params;

  try {
    const resultado = await Evento.delete(id);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: 'Evento não encontrado.' });
    }
    res.json({ mensagem: 'Evento deletado com sucesso!' });
  } catch (erro) {
    console.error('Erro ao deletar evento:', erro);
    res.status(500).json({ mensagem: 'Erro ao deletar evento.' });
  }
}

module.exports = {
  listarEventos,
  buscarEventoPorId,
  cadastrarEvento,
  atualizarEvento,
  atualizarParcialEvento,
  deletarEvento
};


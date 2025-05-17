const ColaboradorModel = require('../models/ColaboradorModel');

// Listar todos os colaboradores
const listarColaboradores = async (req, res) => {
  try {
    const colaboradores = await ColaboradorModel.listarTodos();
    res.status(200).json(colaboradores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar colaboradores.', detalhes: error.message });
  }
};

// Buscar colaborador por ID
const buscarColaboradorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const colaborador = await ColaboradorModel.buscarPorId(id);

    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    res.status(200).json(colaborador);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar colaborador.', detalhes: error.message });
  }
};

// Cadastrar novo colaborador
const cadastrarColaborador = async (req, res) => {
  try {
    const { nome, cargo, email, telefone, foto_url } = req.body;

    if (!nome || !cargo) {
      return res.status(400).json({ erro: 'Nome e cargo são obrigatórios.' });
    }

    const insertId = await ColaboradorModel.cadastrar(nome, cargo, email, telefone, foto_url);
    res.status(201).json({ mensagem: 'Colaborador cadastrado com sucesso!', id: insertId });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar colaborador.', detalhes: error.message });
  }
};

// Atualizar colaborador (PUT - atualização completa)
const atualizarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, email, telefone, foto_url } = req.body;

    const colaboradorExistente = await ColaboradorModel.buscarPorId(id);
    if (!colaboradorExistente) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    await ColaboradorModel.atualizar(id, nome, cargo, email, telefone, foto_url);

    res.status(200).json({ mensagem: 'Colaborador atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar colaborador.', detalhes: error.message });
  }
};

// Atualizar colaborador parcialmente (PATCH)
const editarParcialColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const colaboradorExistente = await ColaboradorModel.buscarPorId(id);
    if (!colaboradorExistente) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    await ColaboradorModel.atualizarParcial(id, dados);

    res.status(200).json({ mensagem: 'Colaborador atualizado parcialmente com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar colaborador.', detalhes: error.message });
  }
};

// Deletar colaborador
const deletarColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const colaboradorExistente = await ColaboradorModel.buscarPorId(id);
    if (!colaboradorExistente) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    await ColaboradorModel.deletar(id);

    res.status(200).json({ mensagem: 'Colaborador excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir colaborador.', detalhes: error.message });
  }
};

module.exports = {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador,
};

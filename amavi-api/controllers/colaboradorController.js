import Colaborador from '../models/Colaborador.js';

// Listar todos
export const listarColaboradores = async (req, res) => {
  try {
    const colaboradores = await Colaborador.findAll();
    res.status(200).json(colaboradores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar colaboradores.', detalhes: error.message });
  }
};

// Buscar por ID
export const buscarColaboradorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const colaborador = await Colaborador.findByPk(id);

    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    res.status(200).json(colaborador);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar colaborador.', detalhes: error.message });
  }
};

// Cadastrar novo
export const cadastrarColaborador = async (req, res) => {
  try {
    const { nome, cargo, email, telefone, foto_url } = req.body;

    if (!nome || !cargo) {
      return res.status(400).json({ erro: 'Nome e cargo são obrigatórios.' });
    }

    const colaborador = await Colaborador.create({ nome, cargo, email, telefone, foto_url });
    res.status(201).json({ mensagem: 'Colaborador cadastrado com sucesso!', colaborador });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar colaborador.', detalhes: error.message });
  }
};

// PUT - Substitui o colaborador
export const atualizarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, email, telefone, foto_url } = req.body;

    const colaborador = await Colaborador.findByPk(id);
    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    await colaborador.update({ nome, cargo, email, telefone, foto_url });
    res.status(200).json({ mensagem: 'Colaborador atualizado com sucesso.', colaborador });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar colaborador.', detalhes: error.message });
  }
};

// PATCH - Atualização parcial
export const editarParcialColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const colaborador = await Colaborador.findByPk(id);
    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    await colaborador.update(dados);
    res.status(200).json({ mensagem: 'Colaborador atualizado parcialmente com sucesso.', colaborador });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar colaborador.', detalhes: error.message });
  }
};

// DELETE - Remover colaborador
export const deletarColaborador = async (req, res) => {
  try {
    const { id } = req.params;

    const colaborador = await Colaborador.findByPk(id);
    if (!colaborador) {
      return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    }

    await colaborador.destroy();
    res.status(200).json({ mensagem: 'Colaborador excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir colaborador.', detalhes: error.message });
  }
};

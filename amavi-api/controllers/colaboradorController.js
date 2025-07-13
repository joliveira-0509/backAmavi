const bcrypt = require('bcryptjs');
const ColaboradorModel = require('../models/ColaboradorModel');

const listarColaboradores = async (req, res) => {
  try {
    const colaboradores = await ColaboradorModel.listarTodos();
    res.status(200).json(colaboradores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar colaboradores.', detalhes: error.message });
  }
};

const buscarColaboradorPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const colaborador = await ColaboradorModel.buscarPorId(id);
    if (!colaborador) return res.status(404).json({ erro: 'Colaborador não encontrado.' });
    res.status(200).json(colaborador);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar colaborador.', detalhes: error.message });
  }
};

const cadastrarColaborador = async (req, res) => {
  try {
    const { nome, cargo, email, telefone, isAdmin, senha } = req.body;
    const imagem = req.file;

    if (!nome || !cargo) {
      return res.status(400).json({ erro: 'Nome e cargo são obrigatórios.' });
    }

    const isAdminBool = isAdmin === 'true' || isAdmin === true;
    let senhaCriptografada = null;

    if (isAdminBool) {
      if (!senha) return res.status(400).json({ erro: 'Senha obrigatória para administradores.' });
      senhaCriptografada = await bcrypt.hash(senha, 10);
    }

    const foto_url = imagem ? imagem.buffer : null;

    const insertId = await ColaboradorModel.cadastrar(
      nome, cargo, email, telefone, foto_url, isAdminBool, senhaCriptografada
    );

    res.status(201).json({ mensagem: 'Colaborador cadastrado com sucesso!', id: insertId });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar colaborador.', detalhes: error.message });
  }
};

const atualizarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cargo, email, telefone } = req.body;
    const imagem = req.file;

    const colaboradorExistente = await ColaboradorModel.buscarPorId(id);
    if (!colaboradorExistente) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    const foto_url = imagem ? imagem.buffer : colaboradorExistente.foto_url;

    await ColaboradorModel.atualizar(id, nome, cargo, email, telefone, foto_url);

    res.status(200).json({ mensagem: 'Colaborador atualizado com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar colaborador.', detalhes: error.message });
  }
};

const editarParcialColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const colaboradorExistente = await ColaboradorModel.buscarPorId(id);
    if (!colaboradorExistente) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    if (req.file) {
      dados.foto_url = req.file.buffer;
    }

    if (dados.senha) {
      dados.senha = await bcrypt.hash(dados.senha, 10);
    }

    await ColaboradorModel.atualizarParcial(id, dados);

    res.status(200).json({ mensagem: 'Colaborador atualizado parcialmente com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao editar colaborador.', detalhes: error.message });
  }
};

const deletarColaborador = async (req, res) => {
  try {
    const { id } = req.params;
    const colaboradorExistente = await ColaboradorModel.buscarPorId(id);
    if (!colaboradorExistente) return res.status(404).json({ erro: 'Colaborador não encontrado.' });

    await ColaboradorModel.deletar(id);
    res.status(200).json({ mensagem: 'Colaborador excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir colaborador.', detalhes: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const colaborador = await ColaboradorModel.buscarPorEmail(email);

    if (!colaborador || !colaborador.isAdmin) {
      return res.status(401).json({ erro: 'Acesso restrito a administradores.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, colaborador.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    // Aqui você pode gerar um token JWT se desejar
    res.status(200).json({
      mensagem: 'Login de administrador realizado com sucesso.',
      colaborador: {
        id: colaborador.id,
        nome: colaborador.nome,
        email: colaborador.email
      }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao realizar login.', detalhes: error.message });
  }
};

module.exports = {
  listarColaboradores,
  buscarColaboradorPorId,
  cadastrarColaborador,
  atualizarColaborador,
  editarParcialColaborador,
  deletarColaborador,
  loginAdmin,
};

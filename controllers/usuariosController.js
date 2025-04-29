import db from '../database/db.js';

// Cadastro de novo usuário
export const cadastrarUsuario = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      rg,
      endereco,
      email,
      num_sus,
      bp_tratamento,
      bp_acompanhamento,
      tipo_usuario,
      id_responsavel
    } = req.body;

    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO Usuarios (
        nome, cpf, rg, endereco, email, num_sus,
        bp_tratamento, bp_acompanhamento, tipo_usuario,
        id_responsavel, foto_url
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [
        nome,
        cpf,
        rg,
        endereco,
        email,
        num_sus,
        bp_tratamento,
        bp_acompanhamento,
        tipo_usuario || 'responsavel', 
        id_responsavel || null,
        foto_url
      ]
    );

    res.status(201).json({ 
      message: 'Usuário cadastrado com sucesso!', 
      usuarioId: result.insertId 
    });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
};

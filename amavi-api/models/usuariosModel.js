const db = require('../db/db.js');

const UsuariosModel = {
  criarUsuario: async (usuario) => {
    try {
      const sql = `
        INSERT INTO Usuarios 
        (nome, cpf, telefone, rg, profissao, endereco, rua, numero, cidade, estado, cep, sexo, email, num_sus, laudo_medico, informacoes_medicas, senha, bp_acompanhamento, tipo_usuario, id_responsavel, data_nascimento, foto_blob, criado_em) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        usuario.nome,
        usuario.cpf,
        usuario.telefone,
        usuario.rg,
        usuario.profissao,
        usuario.endereco,
        usuario.rua,
        usuario.numero,
        usuario.cidade,
        usuario.estado,
        usuario.cep,
        usuario.sexo,
        usuario.email,
        usuario.num_sus,
        usuario.laudo_medico || null,
        usuario.informacoes_medicas || null,
        usuario.senha,
        usuario.bp_acompanhamento || null,
        usuario.tipo_usuario,
        usuario.id_responsavel,
        usuario.data_nascimento,
        usuario.foto_blob || null,
        usuario.criado_em || new Date()
      ];
      const [result] = await db.execute(sql, params);
      return result;
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw err;
    }
  },

  buscarPorNome: async (nome) => {
    const [result] = await db.execute(`SELECT * FROM Usuarios WHERE nome LIKE ?`, [`%${nome}%`]);
    return result;
  },

  buscarPorId: async (id) => {
    const [result] = await db.execute(`SELECT * FROM Usuarios WHERE id = ?`, [id]);
    return result[0];
  },

  buscarPorCpf: async (cpf) => {
    const [result] = await db.execute(`SELECT * FROM Usuarios WHERE cpf = ?`, [cpf]);
    return result[0];
  },

  deletarUsuario: async (id) => {
    const [result] = await db.execute(`DELETE FROM Usuarios WHERE id = ?`, [id]);
    return result;
  },

  putUsuario: async (id, usuario) => {
    const sql = `
      UPDATE Usuarios SET
        nome = ?,
        cpf = ?,
        telefone = ?,
        rg = ?,
        profissao = ?,
        endereco = ?,
        rua = ?,
        numero = ?,
        cidade = ?,
        estado = ?,
        cep = ?,
        sexo = ?,
        email = ?,
        num_sus = ?,
        laudo_medico = ?,
        informacoes_medicas = ?,
        senha = ?,
        bp_acompanhamento = ?,
        tipo_usuario = ?,
        id_responsavel = ?,
        data_nascimento = ?,
        foto_blob = ?,
        criado_em = ?
      WHERE id = ?
    `;
    const params = [
      usuario.nome,
      usuario.cpf,
      usuario.telefone,
      usuario.rg,
      usuario.profissao,
      usuario.endereco,
      usuario.rua,
      usuario.numero,
      usuario.cidade,
      usuario.estado,
      usuario.cep,
      usuario.sexo,
      usuario.email,
      usuario.num_sus,
      usuario.laudo_medico || null,
      usuario.informacoes_medicas || null,
      usuario.senha,
      usuario.bp_acompanhamento || null,
      usuario.tipo_usuario,
      usuario.id_responsavel,
      usuario.data_nascimento,
      usuario.foto_blob || null,
      usuario.criado_em || new Date(),
      id
    ];
    const [result] = await db.execute(sql, params);
    return result;
  },

  patchUsuario: async (id, campos) => {
    const keys = Object.keys(campos);
    const values = Object.values(campos);

    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE Usuarios SET ${setClause} WHERE id = ?`;
    values.push(id);

    const [result] = await db.execute(sql, values);
    return result;
  },

  registrarEvento: async (id_usuario, tipo_evento) => {
    const sql = `INSERT INTO EventoUsuario (id_usuario, tipo_evento) VALUES (?, ?)`;
    const [result] = await db.execute(sql, [id_usuario, tipo_evento]);
    return result;
  },

  atualizarFoto: async (id, foto_blob) => {
    const sql = `UPDATE Usuarios SET foto_blob = ? WHERE id = ?`;
    const [result] = await db.execute(sql, [foto_blob, id]);
    return result;
  }
};

module.exports = UsuariosModel;

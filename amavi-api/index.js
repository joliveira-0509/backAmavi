const express = require('express');
const cors = require('cors');
const db = require('./db/db');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// CORS – apenas o frontend autorizado pode acessar
app.use(cors({
  origin: 'https://amavi.dev.vilhena.ifro.edu.br'
}));

// Testador de conexão ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('✅ Conectado ao banco de dados com sucesso!');
  }
});

// Rotas
app.use('/usuarios', usuariosRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
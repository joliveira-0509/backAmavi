const express = require('express');
const bodyParser = require('body-parser');
const usuariosRoutes = require('./routes/usuarios');
const db = require('./db/db'); // Certifique-se de que o db.js usa mysql2/promise

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para analisar o corpo das requisições
app.use(bodyParser.json());

// Usar as rotas de usuários
app.use('/api', usuariosRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');

});

// Verificar conexão com o banco de dados ao iniciar o servidor
(async () => {
  try {
    await db.query('SELECT 1'); // Executa uma consulta simples para verificar a conexão
    console.log('Conexão com o banco de dados está funcionando.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  }
})();

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

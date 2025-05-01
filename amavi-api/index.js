const express = require('express');
const bodyParser = require('body-parser');
const usuariosRoutes = require('./routes/usuarios');
const db = require('./db/db'); // Certifique-se de que este é o caminho correto para o arquivo de conexão MySQL

const app = express();
const PORT = process.env.PORT || 3000;

// Testar conexão com o banco
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco de dados:', err.message);
    process.exit(1); // Encerra a aplicação se não conectar
  } else {
    console.log('Conectado ao banco de dados com sucesso!');
  }
});

// Middleware para analisar o corpo das requisições
app.use(bodyParser.json());

// Usar as rotas de usuários
app.use('/api', usuariosRoutes);

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

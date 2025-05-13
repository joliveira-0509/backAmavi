require('dotenv/config');
const express = require('express');
const cors = require('cors');

// Importando as rotas
const usuariosRoutes = require('./routes/usuarios.js');
const agendaRoutes = require('./routes/agendaEventoRoutes.js');
const documentacaoRoutes = require('./routes/documentacao.js');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento.js');
const historicoRoutes = require('./routes/historicoAtendimentoRoutes.js');
const colaboradorRoutes = require('./routes/colaboradorRoutes.js');
const rotasLogin = require('./routes/rotaslogin.js');

// Conexão com o banco de dados
const db = require('./db/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Validação de variável de ambiente PORT
if (!process.env.PORT) {
  console.error('A variável de ambiente PORT não está definida.');
  process.exit(1);
}

// Middleware
const allowedOrigins = ['http://example.com', 'http://anotherdomain.com'];

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS'));
    }
  }
}));

app.use(express.json());

// Definição das rotas da API
app.use('/api', usuariosRoutes);
app.use('/api/colaborador', colaboradorRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auth', rotasLogin);

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Verificação da conexão com o banco de dados
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('Conexão com o banco de dados está funcionando.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1); // Encerra o processo com erro
  }
})();

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} no ambiente ${process.env.NODE_ENV || 'desenvolvimento'}`);
});

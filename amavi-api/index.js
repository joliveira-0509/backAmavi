const express = require('express');
const cors = require('cors');
const usuariosRoutes = require('./routes/usuarios');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento');
const historicoRoutes = require('./routes/historicoAtendimentoRoutes');
const { swaggerUi, specs } = require('./swagger'); 
const db = require('./db/db');
const rotasLogin = require('./routes/rotaslogin'); 
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
// Rotas
app.use('/api', usuariosRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auth', rotasLogin); // Integrando as rotas de login
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');
});
// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});
// Verificação da conexão com o banco
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('Conexão com o banco de dados está funcionando.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  }
})();
// Inicialização
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
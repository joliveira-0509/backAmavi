const express = require('express');
const bodyParser = require('body-parser');

// Importações das rotas
const usuariosRoutes = require('./routes/usuarios');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento'); // Requerimentos
const historicoRoutes = require('./routes//historicoAtendimentoRoutes'); // Histórico de atendimento

const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rotas principais
app.use('/api', usuariosRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes); // Rota para solicitações de atendimento
app.use('/api/historico', historicoRoutes); // Rota para histórico de atendimento

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');
});

// Verificação de conexão com o banco
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('Conexão com o banco de dados está funcionando.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  }
})();

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

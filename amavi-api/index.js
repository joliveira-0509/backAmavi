const express = require('express');
const bodyParser = require('body-parser');
const usuariosRoutes = require('./routes/usuarios');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento'); // ✅ nova importação
const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Rotas
app.use('/api', usuariosRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes); // ✅ nova rota para requerimentos

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

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

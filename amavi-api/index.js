const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const usuariosRoutes = require('./routes/usuarios');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento');
const historicoRoutes = require('./routes/historicoAtendimentoRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const rotasLogin = require('./routes/rotaslogin');
const eventoRoutes = require('./routes/eventoRoutes');
const fotoUsuarioRoutes = require('./routes/fotoUsuarioRoutes');
const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Rotas principais
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/colaborador', colaboradorRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auth', rotasLogin);
app.use('/api/evento', eventoRoutes);
// Rota para upload de foto do usuário
app.use('/api', fotoUsuarioRoutes);

app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
});

// Teste de conexão com o banco
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('Conexão com o banco de dados está funcionando.');
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
    process.exit(1);
  }
})();

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;

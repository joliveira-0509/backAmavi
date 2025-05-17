const express = require('express');
const cors = require('cors');

const setupSwagger = require('./swagger');

const usuariosRoutes = require('./routes/usuarios');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento');
const historicoRoutes = require('./routes/historicoAtendimentoRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const rotasLogin = require('./routes/rotaslogin');
const eventoRoutes = require('./routes/eventoRoutes');
const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.PORT) {
  console.error('A variável de ambiente PORT não está definida.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

setupSwagger(app); // ativa Swagger na rota /api-docs

app.use('/api', usuariosRoutes);
app.use('/api/colaborador', colaboradorRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auth', rotasLogin);
app.use('/api/evento', eventoRoutes);

app.get('/', (req, res) => {
  res.send('API de Usuários em funcionamento!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor.' });
});

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

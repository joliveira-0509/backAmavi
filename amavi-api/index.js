
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const db = require('./db/db');

// ====== Importação de Rotas ======
const usuariosRoutes = require('./routes/usuarios');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento');
const historicoRoutes = require('./routes/historicoAtendimentoRoutes');
const loginRoutes = require('./routes/rotaslogin');
const eventoRoutes = require('./routes/eventoRoutes');
const acessosRoutes = require('./routes/acessosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 🎒 Configuração do Multer (Upload de arquivos)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Apenas arquivos PDF, JPEG ou PNG são permitidos.'));
    }
    cb(null, true);
  }
});

// 🌐 Middlewares Globais
app.use(cors({
  origin: [
    'https://amavi.dev.vilhena.ifro.edu.br',
    'http://localhost:3000',
    'https://amaviapi.dev.vilhena.ifro.edu.br'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// 🚏 Rotas da aplicação
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/colaborador', colaboradorRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/evento', eventoRoutes);
app.use('/api/acessos', acessosRoutes);

// 🌟 Rota raiz
app.get('/', (req, res) => {
  res.send('✅ API Facilita AMAVI rodando com sucesso!');
});

// 📡 Verificação de conexão com o banco de dados
(async () => {
  try {
    await db.query('SELECT 1');
    console.log('\x1b[32m%s\x1b[0m', '✅ Conexão com o banco de dados estabelecida com sucesso!');
    // Verifique o max_allowed_packet para suportar longblob em Documentacao.arquivo_url
    const [rows] = await db.query('SHOW VARIABLES LIKE "max_allowed_packet"');
    const maxPacket = parseInt(rows[0].Value);
    if (maxPacket < 16 * 1024 * 1024) {
      console.warn('\x1b[33m⚠️ max_allowed_packet é %s. Recomenda-se aumentar para 16MB ou mais para uploads de arquivos grandes.\x1b[0m', maxPacket);
      // Execute no MySQL: SET GLOBAL max_allowed_packet = 16777216;
    }
  } catch (err) {
    console.error('\x1b[31m❌ ERRO: Falha ao conectar no banco de dados.\nMotivo: %s\x1b[0m', err.message);
    process.exit(1);
  }
})();

// ⚠️ Tratamento Global de Erros
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.error('\x1b[31m❌ Arquivo excede o limite de 10MB\x1b[0m', err);
    return res.status(400).json({ error: 'Arquivo excede o limite de 10MB.' });
  }
  if (err.message === 'Apenas arquivos PDF, JPEG ou PNG são permitidos.') {
    console.error('\x1b[31m❌ Tipo de arquivo inválido\x1b[0m', err);
    return res.status(400).json({ error: err.message });
  }
  console.error('\x1b[41m\x1b[37m❌ ERRO INTERNO NO SERVIDOR\x1b[0m\n📍 Método: %s %s\n📍 Detalhes: %s', req.method, req.url, err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor.',
    detalhe: err.message
  });
});

// 🚀 Start do servidor
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `🚀 Servidor rodando em: https://amaviapi.dev.vilhena.ifro.edu.br:${PORT}`);
});

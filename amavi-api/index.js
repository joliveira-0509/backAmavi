const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const db = require('./db/db');

// Importação das rotas
const usuariosRoutes = require('./routes/usuarios');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const agendaRoutes = require('./routes/agendaEventoRoutes');
const documentacaoRoutes = require('./routes/documentacao');
const solicitacaoRoutes = require('./routes/solicitacaoAtendimento');
const historicoRoutes = require('./routes/historicoAtendimentoRoutes');
const loginRoutes = require('./routes/rotaslogin');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do multer
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Limite de 10MB

// ===== Middlewares globais =====
app.use(cors({
  origin: ['https://amaviapi.dev.vilhena.ifro.edu.br', 'http://localhost:3000'], // Permite frontend local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type']
}));
app.use(express.json());
app.use(cookieParser());

// ===== Rotas =====
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/colaborador', colaboradorRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/documentacao', documentacaoRoutes);
app.use('/api/requerimentos', solicitacaoRoutes);
app.use('/api/historico', historicoRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/evento', eventoRoutes);

// Rota raiz (Healthcheck simples)
app.get('/', (req, res) => {
    res.send('✅ API Facilita AMAVI rodando com sucesso!');
});

// ===== Teste de Conexão com Banco =====
(async () => {
    try {
        await db.query('SELECT 1');
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    } catch (err) {
        console.error('❌ Erro ao conectar no banco de dados:', err.message);
        process.exit(1);
    }
})();

// ===== Manipulação de Erros =====
app.use((err, req, res, next) => {
    console.error('❌ Erro interno:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno no servidor.'
    });
});

// ===== Start do servidor =====
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em https://amaviapi.dev.vilhena.ifro.edu.br:${PORT}`);
});

module.exports = app;
// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentação da API AMAVI',
      version: '1.0.0',
      description: 'Documentação da API com Swagger UI',
    },
    servers: [
      {
        url: 'https://amaviapi.dev.vilhena.ifro.edu.br',
        description: 'Servidor de produção',
      },
    ],
  },
  apis: ['./routes/*.js'], // caminho dos arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;

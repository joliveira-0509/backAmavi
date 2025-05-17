// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API AMAVI',
      version: '1.0.0',
      description: 'Documentação da API',
    },
    servers: [
      {
        url: 'https://amaviapi.dev.vilhena.ifro.edu.br',
        description: 'Servidor de Produção',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
  },
  apis: ['./routes/*.js'], // caminho para seus arquivos de rotas com comentários Swagger
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;

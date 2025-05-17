// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Documentação da API AMAVI',
      version: '1.0.0',
      description: 'Esta é a documentação automática da sua API.',
    },
    servers: [
      {
        url: 'https://amaviapi.dev.vilhena.ifro.edu.br', // seu domínio
      },
    ],
  },
  apis: ['./routes/*.js'], // Caminho para os arquivos de rotas
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;

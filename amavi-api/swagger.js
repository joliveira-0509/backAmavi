// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AMAVI API',
      version: '1.0.0',
      description: 'Documentação da API da AMAVI',
    },
  },
  apis: [path.join(__dirname, './swagger_documentacao')], // apontando para o arquivo de comentários
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};

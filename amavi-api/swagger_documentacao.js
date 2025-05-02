
/**
 * @swagger
 * tags:
 *   - name: Documentacao
 *     description: Gerenciamento de documentos de usuários
 *   - name: SolicitacaoAtendimento
 *     description: Requerimentos de atendimento
 *   - name: HistoricoAtendimento
 *     description: Histórico de atendimentos por usuário
 *   - name: Doacao
 *     description: Registro de doações
 *   - name: Usuarios
 *     description: Cadastro e gerenciamento de usuários
 *   - name: AgendaEvento
 *     description: Gerenciamento de agenda de eventos
 */

/**
 * @swagger
 * /documentacao:
 *   get:
 *     summary: Retorna todos os documentos
 *     tags: [Documentacao]
 *     responses:
 *       200:
 *         description: Lista de documentos
 *
 *   post:
 *     summary: Cadastra um novo documento
 *     tags: [Documentacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - tipo_documento
 *               - caminho_arquivo
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               tipo_documento:
 *                 type: string
 *               caminho_arquivo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Documento criado com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /documentacao/{id_documento}:
 *   delete:
 *     summary: Remove um documento pelo ID
 *     tags: [Documentacao]
 *     parameters:
 *       - in: path
 *         name: id_documento
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Documento deletado com sucesso
 *       404:
 *         description: Documento não encontrado
 */

/**
 * @swagger
 * /solicitacao-atendimento:
 *   get:
 *     summary: Retorna todas as solicitações de atendimento
 *     tags: [SolicitacaoAtendimento]
 *     responses:
 *       200:
 *         description: Lista de solicitações
 *
 *   post:
 *     summary: Cria uma nova solicitação de atendimento
 *     tags: [SolicitacaoAtendimento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usuario
 *               - descricao
 *             properties:
 *               id_usuario:
 *                 type: integer
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Solicitação criada com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /solicitacao-atendimento/{id_solicitacao}:
 *   delete:
 *     summary: Remove uma solicitação pelo ID
 *     tags: [SolicitacaoAtendimento]
 *     parameters:
 *       - in: path
 *         name: id_solicitacao
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Solicitação deletada com sucesso
 *       404:
 *         description: Solicitação não encontrada
 */

/**
 * @swagger
 * /historico-atendimento/{id_usuario}:
 *   get:
 *     summary: Retorna o histórico de atendimentos de um usuário
 *     tags: [HistoricoAtendimento]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário (responsável ou dependente)
 *     responses:
 *       200:
 *         description: Lista de solicitações e atendimentos
 *       404:
 *         description: Usuário não encontrado ou sem histórico
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Retorna todos os usuários
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuários
 *
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - tipo_usuario
 *             properties:
 *               nome:
 *                 type: string
 *               tipo_usuario:
 *                 type: string
 *                 enum: [responsavel, dependente]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /usuarios/{id_usuario}:
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       404:
 *         description: Usuário não encontrado
 */

/**
 * @swagger
 * /usuarios/health:
 *   get:
 *     summary: Verifica a conexão com o banco de dados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Conexão bem-sucedida
 *       500:
 *         description: Erro ao conectar ao banco
 */

/**
 * @swagger
 * /agenda:
 *   get:
 *     summary: Lista todos os eventos
 *     tags: [AgendaEvento]
 *     responses:
 *       200:
 *         description: Lista de eventos
 *
 *   post:
 *     summary: Cadastra um novo evento
 *     tags: [AgendaEvento]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - tipo
 *               - data
 *             properties:
 *               titulo:
 *                 type: string
 *               tipo:
 *                 type: string
 *               data:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Evento cadastrado
 *       400:
 *         description: Dados inválidos
 */

/**
 * @swagger
 * /agenda/tipo/{tipo}:
 *   get:
 *     summary: Lista eventos por tipo
 *     tags: [AgendaEvento]
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de eventos filtrados
 */

/**
 * @swagger
 * /agenda/{id}:
 *   put:
 *     summary: Edita um evento
 *     tags: [AgendaEvento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               tipo:
 *                 type: string
 *               data:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Evento atualizado
 *       404:
 *         description: Evento não encontrado
 *
 *   delete:
 *     summary: Deleta um evento
 *     tags: [AgendaEvento]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Evento deletado
 *       404:
 *         description: Evento não encontrado
 */
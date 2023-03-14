const { Router } = require('express');
const {
  mainGetController,
  getTalkerById,
  mainPostController,
  postTalkerMiddleware,
  tokenMiddleware,
  mainPutController,
} = require('./controllers/talkerControllers');

const talkerRouter = Router();

talkerRouter.get('/', mainGetController);

talkerRouter.post('/', tokenMiddleware, ...postTalkerMiddleware, mainPostController);

talkerRouter.get('/:id', getTalkerById);

talkerRouter.put('/:id', tokenMiddleware, ...postTalkerMiddleware, mainPutController);

module.exports = talkerRouter;

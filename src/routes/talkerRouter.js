const { Router } = require('express');
const {
  mainGetController,
  getTalkerById,
  mainPostController,
  postTalkerMiddleware,
  tokenMiddleware,
  mainPutController,
  mainDeleteController,
  mainGetSearchController,
  mainPatchRateController,
} = require('./controllers/talkerControllers');

const talkerRouter = Router();

talkerRouter.patch('/rate/:id', tokenMiddleware, mainPatchRateController);

talkerRouter.get('/search', tokenMiddleware, mainGetSearchController);

talkerRouter.get('/', mainGetController);

talkerRouter.post('/', tokenMiddleware, ...postTalkerMiddleware, mainPostController);

talkerRouter.get('/:id', getTalkerById);

talkerRouter.put('/:id', tokenMiddleware, ...postTalkerMiddleware, mainPutController);

talkerRouter.delete('/:id', tokenMiddleware, mainDeleteController);

module.exports = talkerRouter;

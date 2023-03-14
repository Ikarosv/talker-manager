const { Router } = require('express');
const {
  mainGetController,
  getTalkerById,
  mainPostController,
  postTalkerMiddleware,
} = require('./controllers/talkerControllers');

const talkerRouter = Router();

talkerRouter.get('/', mainGetController);

talkerRouter.get('/:id', getTalkerById);

talkerRouter.post('/', ...postTalkerMiddleware, mainPostController);

module.exports = talkerRouter;

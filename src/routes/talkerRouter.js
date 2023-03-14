const { Router } = require('express');
const path = require('path');
const fs = require('fs').promises;

const talkerRouter = Router();

const jsonTalkerPath = path.join(__dirname, '../talker.json');

talkerRouter.get('/', async (_req, res) => {
  try {
    const talkers = await fs.readFile(jsonTalkerPath, 'utf-8');
    if (!talkers) return res.status(200).json([]);
    return res.status(200).json(JSON.parse(talkers));
  } catch (err) {
    console.error(err);
  }
});

talkerRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const talkers = await fs.readFile(jsonTalkerPath, 'utf-8');
    const parsedTalkers = JSON.parse(talkers);
    const talker = parsedTalkers.find((talk) => talk.id === Number(id));
    if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    return res.status(200).json(talker);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
});

module.exports = talkerRouter;

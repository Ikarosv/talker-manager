const fs = require('fs').promises;
const path = require('path');

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
const jsonTalkerPath = path.join(__dirname, '../../talker.json');

const mainGetController = async (_req, res) => {
  try {
    const talkers = await fs.readFile(jsonTalkerPath, 'utf-8');
    if (!talkers) return res.status(200).json([]);
    return res.status(200).json(JSON.parse(talkers));
  } catch (err) {
    console.error(err);
  }
};

const findTalker = async (req) => {
  const { id } = req.params;
  const talkers = await fs.readFile(jsonTalkerPath, 'utf-8');
  const parsedTalkers = JSON.parse(talkers);
  return parsedTalkers.find((talk) => talk.id === Number(id));
};

const getTalkerById = async (req, res) => {
  try {
    const talker = await findTalker(req);
    if (!talker) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
    return res.status(200).json(talker);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
  }
};

const tokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  // Validação do token
  if (typeof token === 'undefined') {
    return res.status(401).json({ message: 'Token não encontrado', token });
  }
  console.log(req.headers);
  if (token.length !== 16) return res.status(401).json({ message: 'Token inválido' });

  next();
};

const nameMiddleware = (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }

  next();
};

const ageMiddleware = (req, res, next) => {
  const { age } = req.body;
  if (!age) return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  if (age < 18 || !Number.isInteger(age)) {
    return res.status(400)
      .json({ message: 'O campo "age" deve ser um número inteiro igual ou maior que 18' });
  }
  next();
};

const checkTalk = (talk, res) => {
  const { watchedAt, rate } = talk;

  if (!dateRegex.test(watchedAt)) {
    res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
    return true;
  }
  if (rate < 1 || rate > 5 || !Number.isInteger(rate)) {
    res.status(400).json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
    return true;
  }

  return false;
};

const talkMiddleware = (req, res, next) => {
  const { talk } = req.body;

  if (!talk) return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  if (!talk.watchedAt) {
    return res.status(400)
      .json({ message: 'O campo "watchedAt" é obrigatório' });
  }

  if (typeof talk.rate === 'undefined') {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  }

  if (checkTalk(talk, res)) return;

  next();
};

const mainPostController = async (req, res) => {
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const talkers = await fs.readFile(jsonTalkerPath, 'utf-8');
  const parsedTalkers = JSON.parse(talkers);
  const newTalker = {
    id: parsedTalkers.length + 1,
    name,
    age,
    talk: {
      watchedAt,
      rate,
    },
  };
  parsedTalkers.push(newTalker);
  await fs.writeFile(jsonTalkerPath, JSON.stringify(parsedTalkers));
  return res.status(201).json(newTalker);
};

const mainPutController = async (req, res) => {
  const { name, age, talk } = req.body;
  const { watchedAt, rate } = talk;
  const talkers = await fs.readFile(jsonTalkerPath, 'utf-8');
  const parsedTalkers = JSON.parse(talkers);
  const talker = await findTalker(req);
  if (!talker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  const newTalker = {
    ...talker,
    name,
    age,
    talk: { watchedAt, rate },
  };
  parsedTalkers.push(newTalker);
  await fs.writeFile(jsonTalkerPath, JSON.stringify(parsedTalkers));
  return res.status(200).json(newTalker);
};

const mainDeleteController = async (req, res) => {
  const { id } = req.params;

  const fsres = await fs.readFile(jsonTalkerPath, 'utf-8');
  const talkers = JSON.parse(fsres);
  const filteredTalkers = talkers.filter((talker) => talker.id !== Number(id));
  await fs.writeFile(jsonTalkerPath, JSON.stringify(filteredTalkers));
  return res.status(204).json();
};

const getByRateNumber = (talkers, rateNumber, res) => {
  if (!rateNumber) return talkers;
  if (rateNumber < 1 || rateNumber > 5 || !Number.isInteger(+rateNumber)) {
    res.status(400).json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
    return true;
  }
  const filteredTalkers = talkers.filter((talker) => talker.talk.rate === Number(rateNumber));
  return filteredTalkers;
};

const getByWatchedDate = (talkers, watchedDate, res) => {
  if (!watchedDate) return talkers;
  console.log(typeof watchedDate);
  if (!dateRegex.test(watchedDate)) {
    res.status(400).json({ message: 'O parâmetro "date" deve ter o formato "dd/mm/aaaa"' });
    return true;
  }
  const filteredTalkers = talkers.filter((talker) => talker.talk.watchedAt === watchedDate);
  console.log(filteredTalkers);
  return filteredTalkers;
};

const mainGetSearchController = async (req, res) => {
  const { q: searchTerm, rate: rateNumber, date: watchedDate } = req.query;

  const fsres = await fs.readFile(jsonTalkerPath, 'utf-8');
  const talkers = JSON.parse(fsres);
  let finalReturn = getByRateNumber(talkers, rateNumber, res);
  if (finalReturn === true) return;
  finalReturn = getByWatchedDate(finalReturn, watchedDate, res);
  if (finalReturn === true) return;
  if (searchTerm) {
    finalReturn = finalReturn.filter((talker) => talker.name.includes(searchTerm));
  }
  return res.status(200).json(finalReturn);
};

const mainPatchRateController = async (req, res) => {
  const { id } = req.params;
  const { rate } = req.body;
  if (rate === undefined) return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  if (rate < 1 || rate > 5 || !Number.isInteger(rate)) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um número inteiro entre 1 e 5' });
  }

  const fsres = await fs.readFile(jsonTalkerPath, 'utf-8');
  const talkers = JSON.parse(fsres);
  const talkerIndex = talkers.findIndex((talker) => talker.id === Number(id));
  if (!talkerIndex) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  talkers[talkerIndex].talk.rate = rate;
  await fs.writeFile(jsonTalkerPath, JSON.stringify(talkers));
  return res.status(204).json();
};

module.exports = {
  mainGetController,
  getTalkerById,
  mainPostController,
  mainPutController,
  tokenMiddleware,
  mainDeleteController,
  mainGetSearchController,
  mainPatchRateController,
  postTalkerMiddleware: [nameMiddleware, ageMiddleware, talkMiddleware],
};

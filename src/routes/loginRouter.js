const { Router } = require('express');
const crypto = require('crypto');

const loginRouter = Router();

const loginMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

  if (!email) {
    return res.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }

  if (!password) {
    return res.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }

  next();
};

loginRouter.post('/', loginMiddleware, (req, res) => {
  try {
    crypto.randomBytes(8, (err, buffer) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      const token = buffer.toString('hex');
      res.status(200).json({ token });
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = loginRouter;

const { Router } = require('express');
const crypto = require('crypto');

const loginRouter = Router();

loginRouter.post('/', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields must be filled' });
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

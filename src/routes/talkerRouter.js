const { Router } = require("express");
const path = require("path");
const fs = require("fs").promises;

const talkerRouter = Router();

const jsonTalkerPath = path.join(__dirname, "../talker.json");

talkerRouter.get("/", async (_req, res) => {
  try {
    const talkers = await fs.readFile(jsonTalkerPath, "utf-8");
    if (!talkers) return res.status(200).json([]);
    return res.status(200).json(JSON.parse(talkers));
  } catch (err) {
    console.error(err);
  }
})

module.exports = talkerRouter;

const express = require('express');
const GameFactory = require('./games.factory');

const router = express.Router();

router.get('/:gameType', async (req, res) => {
  const { gameType } = req.params;

  try {
    const gameHandler = GameFactory.getGameHandler(gameType);
    const games = await gameHandler.getAll();
    res.json(games);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:gameType/:id', async (req, res) => {
  const { gameType, id } = req.params;

  try {
    const gameHandler = GameFactory.getGameHandler(gameType);
    const game = await gameHandler.getById(id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:gameType', async (req, res) => {
  const { gameType } = req.params;
  const data = req.body;

  try {
    const gameHandler = GameFactory.getGameHandler(gameType);
    const newGame = await gameHandler.create(data);
    res.status(201).json(newGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:gameType/:id', async (req, res) => {
  const { gameType, id } = req.params;
  const data = req.body;

  try {
    const gameHandler = GameFactory.getGameHandler(gameType);
    const updatedGame = await gameHandler.update(id, data);
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:gameType/:id', async (req, res) => {
  const { gameType, id } = req.params;

  try {
    const gameHandler = GameFactory.getGameHandler(gameType);
    await gameHandler.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
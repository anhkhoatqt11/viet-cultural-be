const express = require('express');
const {PuzzlePieceHandler} = require('./handlers/puzzle.handlers');
const {QuizGameQuestionHandler} = require('./handlers/quiz.handlers');
const {TreasureCardHandler} = require('./handlers/treasure.handlers');
const WordHandler = require('./handlers/word.handlers');

const router = express.Router();

const handlers = {
  puzzlePiece: new PuzzlePieceHandler(),
  quizGameQuestion: new QuizGameQuestionHandler(),
  treasureCard: new TreasureCardHandler(),
  wordGame: new WordHandler(),
};

router.get('/:table/:parentId?', async (req, res) => {
  const { table, parentId } = req.params;

  try {
    const handler = handlers[table];
    if (!handler) throw new Error('Invalid table name');
    const data = parentId ? await handler.getAll(parentId) : await handler.getAll();
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:table/:id', async (req, res) => {
  const { table, id } = req.params;

  try {
    const handler = handlers[table];
    if (!handler) throw new Error('Invalid table name');
    const data = await handler.getById(id);
    if (!data) return res.status(404).json({ error: 'Record not found' });
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:table', async (req, res) => {
  const { table } = req.params;
  const data = req.body;

  try {
    const handler = handlers[table];
    if (!handler) throw new Error('Invalid table name');
    const newRecord = await handler.create(data);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const data = req.body;

  try {
    const handler = handlers[table];
    if (!handler) throw new Error('Invalid table name');
    const updatedRecord = await handler.update(id, data);
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:table/:id', async (req, res) => {
  const { table, id } = req.params;

  try {
    const handler = handlers[table];
    if (!handler) throw new Error('Invalid table name');
    await handler.delete(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
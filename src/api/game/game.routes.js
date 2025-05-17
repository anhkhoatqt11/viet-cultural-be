const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { getGameData, updateGameHistory, getGameHistory } = require('./game.services');

/**
 * @swagger
 * /game/get-gamedata:
 *   get:
 *     summary: Retrieve game data based on region and game type
 *     tags:
 *       - Games
 *     parameters:
 *       - in: query
 *         name: regionId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the region
 *       - in: query
 *         name: gameType
 *         schema:
 *           type: string
 *           enum:
 *             - word
 *             - quiz
 *             - puzzle
 *             - treasure
 *         required: true
 *         description: The code of the game type
 *     responses:
 *       200:
 *         description: Successfully retrieved game data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400:
 *         description: Unsupported game type
 *       404:
 *         description: Game type not found
 *       500:
 *         description: Internal server error
 */
router.get('/get-gamedata', async (req, res, next) => {
    try {
        const { regionId, gameType } = req.query;

        const data = await getGameData(regionId, gameType);

        res.json(data);
    } catch (err) {
        if (err.message === 'Game type not found' || err.message === 'Unsupported game type') {
            return res.status(400).json({ message: err.message });
        }
        next(err);
    }
});


module.exports = router;
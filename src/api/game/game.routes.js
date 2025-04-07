const express = require('express');
const router = express.Router();

const { getGameDataByRegionAndType } = require('./game.services');


/**
 * @swagger
 * /game/get-gameData:
 *   post:
 *     summary: Retrieve game data by region and type
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: regionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the region
 *       - in: query
 *         name: gameType
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of the game
 *     responses:
 *       200:
 *         description: Successfully retrieved game data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/get-gameData', async (req, res, next) => {
    try {
        const { regionId, gameType } = req.query;
        // Assuming you have a function to fetch game data by regionId and gameType
        const gameData = await getGameDataByRegionAndType(Number(regionId), gameType);
        res.json(gameData);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
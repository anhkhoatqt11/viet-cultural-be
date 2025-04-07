const express = require('express');
const router = express.Router();


const { getAfterInfo } = require('./afterInfo.services');

/**
 * @swagger
 * /afterInfo/get-afterInfo:
 *   description: Retrieve afterInfo based on gameId and questionNumber
 *   post:
 *     tags: [AfterInfo]
 *     summary: Retrieve afterInfo based on gameId and questionNumber
 *     parameters:
 *       - in: query
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game
 *       - in: query
 *         name: questionNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The question number
 *     responses:
 *       200:
 *         description: Successfully retrieved afterInfo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/get-afterInfo', async (req, res, next) => {
    try {
        const { gameId, questionNumber } = req.query;
        const afterInfo = await getAfterInfo(Number(gameId), Number(questionNumber));
        res.json(afterInfo);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
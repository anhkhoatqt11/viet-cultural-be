const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const { isQuestionRelated } = require('../../helper/question.helper');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })


/**
 * @swagger
 * /assistance:
 *   post:
 *     summary: Generate a response using Google Generative AI
 *     description: Accepts a prompt and generates a response using the Gemini model.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The input prompt for the AI model.
 *                 example: "What is the capital of France?"
 *     responses:
 *       200:
 *         description: Successfully generated a response.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The generated response from the AI model.
 *                   example: "The capital of France is Paris."
 *       400:
 *         description: Bad request due to missing or invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Hãy điền câu hỏi"
 *       500:
 *         description: Internal server error.
 */
router.post('/', async (req, res, next) => {
    try {
        const { prompt: usePrompt } = req.body
        if (!usePrompt) return res.status(400).json({ error: 'Hãy điền câu hỏi' });
        if (!isQuestionRelated(usePrompt)) return res.status(400).json({ error: 'Tôi không thể trả lời câu hỏi này' });
        const result = await model.generateContent(usePrompt)
        const response = await result.response;
        const text = response.text();
        res.json({ message: text });
    } catch (error) {
        next(error)
    }
})
module.exports = router;
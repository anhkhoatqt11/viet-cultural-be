const { GoogleGenerativeAI } = require('@google/generative-ai');
const express = require('express');
const { isQuestionRelated } = require('../../helper/question.helper');
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({model: 'gemini-2.0-flash'})

router.post('/', async (req, res, next) => {
    try {
        const {prompt: usePrompt} = req.body
        if(!usePrompt) return res.status(400).json({ error: 'Hãy điền câu hỏi' });
        if(!isQuestionRelated(usePrompt)) return res.status(400).json({ error: 'Tôi không thể trả lời câu hỏi này' });
        const result = await model.generateContent(usePrompt)
        const response = await result.response;
        const text = response.text();
        res.json({ message: text });
    } catch (error) {
        next(error)
    }
})
module.exports = router;
const express = require('express')
const router = express.Router()
const journeyService = require('./journey.services')

router.get('/', async (req, res, next) => {
    try {
        res.json({
            metadata: await journeyService.getAllJourneys()
        })
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        res.json(await journeyService.getJourneyById(req.params.id))
    } catch (error) {
        next(error)
    }
})

module.exports = router
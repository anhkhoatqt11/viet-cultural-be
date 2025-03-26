const express = require('express')
const router = express.Router()
const journeyService = require('./journey.services')

router.get('/', async (req, res, next) => {
    try {
        res.json(await journeyService.getAllJourneys())
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

router.post('/', async (req, res, next) => {
    try {
        res.json(await journeyService.createJourney(req.body))
    } catch (error) {
        next(error)
    }
})

router.put('/update/:id', async (req, res, next) => {
    try {
        res.json(await journeyService.updateJourney(req.body, req.params.id))
    } catch (error) {
        next(error)
    }
})

router.delete('/delete/:id', async (req, res, next) => {
    try {
        res.json({
            message: "Đã xóa journey",
            data: await journeyService.deleteJourney(req.params.id)
        })
    } catch (error) {
        next(error)
    }
})
module.exports = router
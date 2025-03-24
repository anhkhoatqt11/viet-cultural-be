const express = require('express')
const router = express.Router()
const destinationService = require('../destination/destination.services')

router.get('/', async(req, res, next) => {
    try {
        const destination = await destinationService.getAllDestination()
        res.json(destination)
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async(req, res, next) => {
    try {
        const destinationFound = await destinationService.getDestinationById(req.params.id)
        res.json(destinationFound)
    } catch (error) {
        next(error)
    }
})

router.post('/', async(req, res, next) => {
    try {
        const newDestination = await destinationService.createDestination(req.body)
        res.json(newDestination)
    } catch (error) {
        next(error)
    }
})

router.put('/edit/:id', async (req, res, next) => {
    try {
        res.json({
            message: "Đã chỉnh sửa địa điểm",
            data: await destinationService.updateDestination(req.body, req.params.id)
        })
    } catch (error) {
        next(error)
    }
})

router.delete('/delete/:id', async (req, res, next) => {
    try {
        res.json({
            message: "Đã xóa địa điểm",
            data: await destinationService.deleteDestination(req.params.id)
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router
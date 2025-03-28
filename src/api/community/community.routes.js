const express = require('express')
const router = express.Router()
const communityService = require('./community.services')

router.get('/', async(req, res, next) => {
    try {
        res.json(await communityService.getAllComunitities())
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        res.json(await communityService.getComunityById(req.params.id))
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        res.json({
            message: "Tạo cộng đồng thành công!",
            data: await communityService.createComunity(req.body)
        })
    } catch (error) {
        next(error)
    }
})

router.put('/edit/:id', async (req, res, next) => {
    try {
        res.json({
            message: "Cập nhật thành công!",
            data: await communityService.updateCommunity(req.body, req.params.id)
        })
    } catch (error) {
        next(error)
    }
})

router.delete('/delete/:id', async(req, res, next) => {
    try {
        res.json({
            message: "Đã xóa cộng đồng!",
            data: await communityService.deleteCommunity(req.params.id)
        })
    } catch (error) {
        next(error)
    }
})

module.exports = router
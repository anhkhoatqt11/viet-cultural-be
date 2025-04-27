const  { db } = require('../../utils/db')

const createFeedback = async (userId, data) => {
    return await db.feedback.create({
        data: {
            user_id_id: userId,
            ...data
        }
    })
}

const getAllFeedback = async () => {
    return await db.feedback.findMany()
}

module.exports = {
    createFeedback,
    getAllFeedback
}
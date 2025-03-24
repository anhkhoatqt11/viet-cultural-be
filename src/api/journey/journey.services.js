const { db } = require('../../utils/db')

const getAllJourneys = async () => {
    return await db.journeys.findMany();
}

const getJourneyById = async (id) => {
    const destinationFound = await db.journeys.findUnique({
        where: {id: parseInt(id)}
    })
    return destinationFound
}

const createJourney = async (journeyData) => {
    const {user_id, name, description, destination} = journeyData
    return await db.journeys.create({
        data: {
            user_id: parseInt(user_id),
            name,
            description,
            destinations,
            created_at: new Date()
        }
    })
}

module.exports = {
    getAllJourneys,
    getJourneyById,
    createJourney
}
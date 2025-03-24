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
    const {user_id, name, description, destinations} = journeyData
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

const updateJourney = async (updateData, id) => {
    const {user_id, name, description, destinations} = updateData
    return await db.journeys.update({
        where: {id: parseInt(id)},
        data: {
            user_id: parseInt(user_id),
            name,
            description,
            destinations
        }
    })
}

const deleteJourney = async (id) => {
    return await db.journeys.delete({
        where: {id: parseInt(id)}
    })
}

module.exports = {
    getAllJourneys,
    getJourneyById,
    createJourney,
    updateJourney,
    deleteJourney
}
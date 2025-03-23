const { db } = require('../../utils/db')

const getAllDestination = async () => {
    try {
        const destinations = await db.destinations.findMany();
        return destinations
    } catch (error) {
        throw new Error(`${error.message}`);
    }
}

const getDestinationById = async (id) => {
    const destinationFound = await db.destinations.findUnique({
        where: {id: parseInt(id)}
    })
    if (!destinationFound) {
        throw new Error('Không tìm thấy địa điểm');
    }
    return destinationFound

}

const createDestination = async (destinationData) => {
    const {journey_id, name, description, media} = destinationData
    const newDestination = await db.destinations.create({
        data: {
            journey_id: parseInt(journey_id),
            name,
            description,
            media,
            created_at: new Date()
        }
    })
    return newDestination

}

const updateDestination = async (updateData, id) => {
    const {journey_id, name, description, media} = updateData
    return await db.destinations.update({
        where: {id: parseInt(id)},
        data: {
            journey_id: parseInt(journey_id),
            name,
            description,
            media
        }
    })
} 

const deleteDestination = async (id) => {
    return await db.destinations.delete({
        where: {id: parseInt(id)}
    })
}

module.exports = {
    getAllDestination,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination
}
const { db } = require('../../utils/db')

const getAllComunitities = async () => {
    return await db.communities.findMany()
}

const getComunityById = async (id) => {
    const communityFound = await db.communities.findUnique({
        where: {id: parseInt(id)}
    })
    if (!communityFound) {
        throw new Error('Không tìm thấy địa điểm');
    }
    return communityFound
}

const createComunity = async (community) => {
    const {name, description, member_quantity} = community
    return await db.communities.create({
        data: {
            name, 
            description,
            member_quantity,
            created_at: new Date()
        }
    })
}

const updateCommunity = async (updateData, id) => {
    const {name, description, member_quantity} = updateData
    return await db.communities.update({
        where: {id: parseInt(id)},
        data: {
            name, 
            description,
            member_quantity
        }
    })
}

const deleteCommunity = async (id) => {
    return await db.communities.delete({
        where: {id: parseInt(id)}
    })
}

module.exports = {
    getAllComunitities,
    getComunityById,
    createComunity,
    updateCommunity,
    deleteCommunity
}
const { db } = require('../../utils/db')

async function createProcess(userId, achievementId) {
    return await db.play_process.create({
        data: {
            user_id_id: userId,
            achievement_id_id: achievementId
        }
    })
}

async function getProcessById(id) {
    return await db.play_process.findUnique({
        where: {
            id: id
        }
    })
}

async function updateProcess(id, updateData) {
    const currProcess = await db.play_process.findUnique({
        where: {
            id: id
        }
    })

    if (!currProcess) {
        throw new Error('Process not found');
    }

    let stars = currProcess.stars || 0

    if(updateData.history === true && !currProcess.history)
    {
        stars += 1
    }

    if (updateData.intangible_heritage === true && !currProcess.intangible_heritage) {
        stars += 1;
    }

    if (updateData.tangible_heritage === true && !currProcess.tangible_heritage) {
        stars += 1;
    }

    return await db.play_process.update({
        where: {
            id: id
        },
        data: {
            ...updateData,
            stars: stars
        }
    })
}

async function deleteProcessById(id) {
    return await db.play_process.delete({
        where: {
            id: id
        }
    })
}

module.exports = {
    createProcess,
    getProcessById,
    updateProcess,
    deleteProcessById
}
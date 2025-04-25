const { db } = require('../../utils/db')

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

async function createAchievement(data) { 
    return await db.achievements.create({
        data: {
            user_id_id: data.userId,
            region_id_id: data.regionId,
            name: data.name,
            description: data.description
        }
    })
}

async function getAllAchievements() {
    const achievements = await db.achievements.findMany({
        include: {
            media: true
        }
    })

    return achievements.map((achievement) => ({
        ...achievement,
        imageUrl: achievement.media && achievement.media.key ? `${IMAGE_BASE_URL}${achievement.media.key}` : null,
    }))
}

async function getAchievementById(userId, regionId) {
    const achievement = await db.achievements.findFirst({
        where: {
            user_id_id: userId,
            region_id_id: regionId,
        }
    })

    return {
        ...achievement,
        imageUrl: achievement.media && achievement.media.key ? `${IMAGE_BASE_URL}${achievement.media.key}` : null,
    }
}

async function updateAchievement(userId, regionId, updateData) {
    const achievement = await db.achievements.findFirst({
        where: {
            user_id_id: userId,
            region_id_id: regionId
        }
    })

    if(!achievement)
    {
        throw new Error("Achievement not found")
    }

    let stars = parseInt(achievement.stars) || 0

    if(!achievement.history && updateData.history === true)
    {
        stars += 1
    }

    if(!achievement.intangible_heritage && updateData.intangible_heritage === true)
    {
        stars += 1
    }

    if(!achievement.tangible_heritage && updateData.tangible_heritage === true)
    {
        stars += 1
    }
    console.log(stars);
    
    return await db.achievements.update({
        where: {
            id: parseInt(achievement.id)
        },
        data: {
            ...updateData,
            stars: stars
        }
    })
}

async function deleteAchievement(userId, regionId) {
    return await db.achievements.delete({
        where: {
            user_id_id: userId,
            region_id_id: regionId
        }
    })
    
}

module.exports = {
    createAchievement,
    getAllAchievements,
    getAchievementById,
    updateAchievement,
    deleteAchievement
}
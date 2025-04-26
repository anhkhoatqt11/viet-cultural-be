const { db } = require('../../utils/db')

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

function getBadge(regionId) {
    switch (regionId) {
        case 1:
            return 107
        case 2: 
            return 106
        case 3:
            return 109
        case 4: 
            return 108
        case 6:
            return 110
        case 7:
            return 111
        default:
            break;
    }
}

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

async function createAchievementForAllRegions(userId) {
    const regions = await db.regions.findMany()

    const achievements = regions.map(region => ({
        user_id_id: userId,
        region_id_id: region.id,
        name: region.region_name,
        description: `Default achievement for region ${region.region_name}`,
        stars: 0,
        badge_id: getBadge(region.id),
        history: false,
        intangible_heritage: false,
        tangible_heritage: false
    }))

    return await db.achievements.createMany({
        data: achievements
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
        },
        include: {
            media: true
        }
    })

    return {
        ...achievement,
        imageUrl: achievement.media && achievement.media.key ? `${IMAGE_BASE_URL}${achievement.media.key}` : null,
    }
}

async function getAchievementByUserId(userId) {
    const achievements = await db.achievements.findMany({
        where: {
            user_id_id: userId
        },
        include: {
            media: true
        }
    })

    return achievements.map((achievement) => ({
        ...achievement,
        imageUrl: achievement.media && achievement.media.key ? `${IMAGE_BASE_URL}${achievement.media.key}` : null,
    }))
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
    getAchievementByUserId,
    updateAchievement,
    deleteAchievement,
    createAchievementForAllRegions
}
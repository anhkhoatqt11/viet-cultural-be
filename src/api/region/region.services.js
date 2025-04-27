const { db } = require('../../utils/db');

function createRegion(region) {
    return db.regions.create({
        data: region,
    });
}
async function findRegionById(id) {
    const region = await db.regions.findUnique({
        where: {
            id: id,
        },
        include: {
            puzzle_games: {
                select: {
                    gametype_id: true,
                },
            },
            quiz_games: {
                select: {
                    gametype_id: true,
                },
            },
            treasure_games: {
                select: {
                    gametype_id: true,
                },
            },
            word_games: {
                select: {
                    gametype_id: true,
                },
            },
        },
    });

    if (region) {
        const gameTypeIds = [
            ...region.puzzle_games.map(game => game.gametype_id),
            ...region.quiz_games.map(game => game.gametype_id),
            ...region.treasure_games.map(game => game.gametype_id),
            ...region.word_games.map(game => game.gametype_id),
        ];
        return {
            ...region,
            game: [...new Set(gameTypeIds)].sort((a, b) => a - b), // Ensure unique and sorted gameType IDs
        };
    }
    return null;
}

function editRegionById(id, region) {
    return db.regions.update({
        where: {
            id,
        },
        data: region,
    });
}

function deleteRegionById(id) {
    return db.regions.delete({
        where: {
            id,
        },
    });
}

module.exports = {
    createRegion,
    findRegionById,
    editRegionById,
    deleteRegionById,
};
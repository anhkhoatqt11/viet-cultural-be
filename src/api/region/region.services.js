const { db } = require('../../utils/db');

function createRegion(region) {
    return db.region.create({
        data: region,
    });
}
function findRegionById(id) {
    return db.region.findUnique({
        where: {
            id: id,
        },
        include: {
            PuzzleGame: {
                select: {
                    gametype: true,
                },
            },
            QuizGame: {
                select: {
                    gametype: true,
                },
            },
            TreasureGame: {
                select: {
                    gametype: true,
                },
            },
            wordGames: {
                select: {
                    gametype: true,
                },
            },
        },
    }).then(region => {
        if (region) {
            const gameTypeIds = [
                ...region.PuzzleGame.map(game => game.gametype),
                ...region.QuizGame.map(game => game.gametype),
                ...region.TreasureGame.map(game => game.gametype),
                ...region.wordGames.map(game => game.gametype),
            ];
            return {
                ...region,
                game: [...new Set(gameTypeIds)], // Ensure unique gameType IDs
            };
        }
        return null;
    });
}

function editRegionById(id, region) {
    return db.region.update({
        where: {
            id,
        },
        data: region,
    });
}

function deleteRegionById(id) {
    return db.region.delete({
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
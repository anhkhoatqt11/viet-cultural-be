const { db } = require('../../utils/db');


function getGameDataByRegionAndType(regionId, gameType) {
    return db.game.findMany({
        where: {
            regionId: regionId,
            gameType: gameType,
        },
    });
}

module.exports = {
    getGameDataByRegionAndType,
};
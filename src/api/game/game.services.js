const { db } = require('../../utils/db');


async function getGameDataByRegionAndType(regionId, gameType) {
    try {
        const gameData = await db.game_type.findUnique({
            where: { id: gameType },
            include: {
                puzzle_game: {
                    where: { regionid: regionId },
                    include: {
                        puzzle_pieces: true,
                    },
                },
                quiz_game: {
                    where: { regionid: regionId },
                    include: {
                        quiz_game_qa: true,
                    },
                },
                treasure_game: {
                    where: { regionid: regionId },
                    include: {
                        treasure_connection_cards: true,
                    },
                },
            },
        });

        return gameData;
    } catch (error) {
        console.error("Error fetching game data:", error);
        throw new Error("Failed to fetch game data");
    }
}


module.exports = {
    getGameDataByRegionAndType,
};
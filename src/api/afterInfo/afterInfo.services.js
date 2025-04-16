const { db } = require('../../utils/db');


async function getAfterInfo(gameTypeId, gameId) {
    const info = await db.after_question_info.findFirst({
        where: {
            game_type_id_id: parseInt(gameTypeId, 10),
            OR: [
                { puzzle_game_id_id: parseInt(gameId, 10) },
                { quiz_game_id_id: parseInt(gameId, 10) },
                { treasure_game_id_id: parseInt(gameId, 10) },
                { word_game_id_id: parseInt(gameId, 10) },
            ],
        },
        include: {
            media_links: {
                select: {
                    src: true,
                    alt: true,
                },
            },
            information_slides: {
                select: {
                    heading: true,
                    content: true,
                },
            },
        },
    });

    if (!info) {
        return null;
    }

    const formattedOutput = {
        topic: {
            name: info.topic_name,
            link: info.media_links,
            slides: info.information_slides,
        },
    };

    return formattedOutput;
}


module.exports = {
    getAfterInfo,
};
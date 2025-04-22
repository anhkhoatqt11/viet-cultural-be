const { db } = require('../../utils/db');

async function getAfterInfo(gameTypeId, gameId) {
    const info = await db.after_question_info.findFirst({
        where: {
            game_type_id_id: 1,
            OR: [
                { puzzle_game_id_id: 1 },
                { quiz_game_id_id: 1 },
                { treasure_game_id_id: 1 },
                { word_game_id_id: 1 }
            ]
        },
        include: {
            media_links: {
                select: {
                    alt: true,
                    media_links_rels: {
                        select: {
                            id: true,
                            order: true,
                            path: true
                        }
                    }
                }
            },
            information_slides: {
                select: {
                    heading: true,
                    information_slides_content: {
                        select: {
                            id: true,
                            order: true,
                            paragraph: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    }
                }
            }
        }
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
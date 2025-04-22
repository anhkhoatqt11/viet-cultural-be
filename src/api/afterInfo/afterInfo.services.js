const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

async function getAfterInfo(gameTypeId, gameId) {
    const info = await db.after_question_info.findFirst({
        where: {
            game_type_id_id: Number(gameTypeId),
            OR: [
                { puzzle_game_id_id: Number(gameId) },
                { quiz_game_id_id: Number(gameId) },
                { treasure_game_id_id: Number(gameId) },
                { word_game_id_id: Number(gameId) }
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
                            path: true,
                            media: {
                                select: {
                                    key: true
                                }
                            }
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

    const formattedLinks = info.media_links.map(link => ({
        alt: link.alt,
        images: link.media_links_rels.map(rel => ({
            id: rel.id,
            order: rel.order,
            path: rel.path,
            imageUrl: rel.media && rel.media.key ? `${IMAGE_BASE_URL}${rel.media.key}` : null
        }))
    }));

    const formattedSlides = info.information_slides.map(slide => ({
        heading: slide.heading,
        content: slide.information_slides_content
    }));

    const formattedOutput = {
        topic: {
            name: info.topic_name,
            link: formattedLinks,
            slides: formattedSlides,
        },
    };

    return formattedOutput;
}

module.exports = {
    getAfterInfo,
};
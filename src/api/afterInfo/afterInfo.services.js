const { db } = require('../../utils/db');


async function getAfterInfo(gameTypeId, gameId) {
    const info = await db.afterQuestionInformation.findFirst({
        where: {
            gameTypeId: parseInt(gameTypeId, 10),
            OR: [
                { puzzleGameId: parseInt(gameId, 10) },
                { quizGameId: parseInt(gameId, 10) },
                { treasureGameId: parseInt(gameId, 10) },
                { wordGameId: parseInt(gameId, 10) },
            ],
        },
        include: {
            mediaLinks: {
                select: {
                    src: true,
                    alt: true,
                },
            },
            infoSlides: {
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
            name: info.topicName,
            link: info.mediaLinks,
            slides: info.infoSlides,
        },
    };

    return formattedOutput;
}


module.exports = {
    getAfterInfo,
};
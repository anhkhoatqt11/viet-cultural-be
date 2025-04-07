const { db } = require('../../utils/db');


function getAfterInfo(gameId, questionNumber) {
    return db.afterQuestionInformation.findMany({
        where: {
            gameId: gameId,
            questionNumber: questionNumber,
        },
    });
}

module.exports = {
    getAfterInfo,
};
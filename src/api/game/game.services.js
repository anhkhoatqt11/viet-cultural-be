const { db } = require('../../utils/db');

async function getGameData(regionId, gameType) {
    const gameTypeData = await db.game_types.findUnique({
        where: { code: gameType },
        include: {
            WordGame: { // Corrected relation name
                where: { regionid: Number(regionId) },
            },
            QuizGame: { // Corrected relation name
                where: { regionid: Number(regionId) },
                include: { QuizGameQuestion: true }, // Corrected relation name
            },
            PuzzleGame: { // Corrected relation name
                where: { regionid: Number(regionId) },
                include: { PuzzlePiece: true }, // Corrected relation name
            },
            TreasureGame: { // Corrected relation name
                where: { regionid: Number(regionId) },
                include: { TreasureCard: true }, // Corrected relation name
            },
        },
    });

    if (!gameTypeData) {
        throw new Error('Game type not found');
    }

    switch (gameTypeData.code) {
        case 'word':
            return gameTypeData.WordGame.map((game) => ({
                id: game.id,
                question: game.question,
                hint: game.hint,
                answer: game.answer,
                correct_letters: game.correct_letters,
                letters: game.letters,
            }));

        case 'quiz':
            return {
                question: gameTypeData.QuizGame.flatMap((game) =>
                    game.QuizGameQuestion.map((q) => ({
                        id: q.id,
                        question: q.question,
                        options: {
                            A: q.optionA,
                            B: q.optionB,
                            C: q.optionC,
                            ...(q.optionD && { D: q.optionD }),
                        },
                        correctAnswer: q.correctAnswer,
                    }))
                ),
            };

        case 'puzzle':
            return gameTypeData.PuzzleGame.map((game) => ({
                id: game.id,
                imageurl: game.imageurl,
                pieces: game.PuzzlePiece.map((piece) => ({
                    id: piece.id,
                    piece_index: piece.piece_index,
                    x_position: piece.x_position,
                    y_position: piece.y_position,
                    correct_x: piece.correct_x,
                    correct_y: piece.correct_y,
                    image_piece_url: piece.image_piece_url,
                })),
            }));

        case 'treasure':
            return gameTypeData.TreasureGame.map((game) => ({
                id: game.id,
                title: game.title,
                description: game.description,
                cardsData: game.TreasureCard.map((card) => ({
                    type: card.type,
                    value: card.value,
                    matchGroup: card.matchGroup,
                })),
            }));

        default:
            throw new Error('Unsupported game type');
    }
}

module.exports = {
    getGameData,
};

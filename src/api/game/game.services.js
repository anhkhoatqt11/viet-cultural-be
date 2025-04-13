const { db } = require('../../utils/db');

async function getGameData(regionId, gameType) {
    const gameTypeData = await db.game_type.findUnique({
        where: { code: gameType },
        include: {
            word_games: {
                where: { regionid: Number(regionId) },
            },
            quiz_games: {
                where: { regionid: Number(regionId) },
                include: { questions: true },
            },
            puzzle_games: {
                where: { regionid: Number(regionId) },
                include: { pieces: true },
            },
            treasure_games: {
                where: { regionid: Number(regionId) },
                include: { cards: true },
            },
        },
    });

    if (!gameTypeData) {
        throw new Error('Game type not found');
    }

    switch (gameTypeData.code) {
        case 'word':
            return gameTypeData.word_games.map((game) => ({
                id: game.id,
                question: game.question,
                hint: game.hint,
                answer: game.answer,
                correct_letters: game.correct_letters,
                letters: game.letters,
            }));

        case 'quiz':
            return {
                question: gameTypeData.quiz_games.flatMap((game) =>
                    game.questions.map((q) => ({
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
            return gameTypeData.puzzle_games.map((game) => ({
                id: game.id,
                imageurl: game.imageurl,
                pieces: game.pieces.map((piece) => ({
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
            return gameTypeData.treasure_games.map((game) => ({
                id: game.id,
                title: game.title,
                description: game.description,
                cardsData: game.cards.map((card) => ({
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
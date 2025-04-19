const { db } = require('../../utils/db');

async function getGameData(regionId, gameType) {
    const gameTypeData = await db.game_types.findUnique({
        where: { code: gameType },
        include: {
            word_games: { // Corrected relation name
                where: { region_id: Number(regionId) },
            },
            quiz_games: { // Corrected relation name
                where: { regionid_id: Number(regionId) },
                include: { quiz_game_questions: true }, // Corrected relation name
            },
            puzzle_games: { // Corrected relation name
                where: { regionid_id: Number(regionId) },
                include: { puzzle_pieces: true }, // Corrected relation name
            },
            treasure_games: { // Corrected relation name
                where: { region_id: Number(regionId) },
                include: { treasure_cards: true }, // Corrected relation name
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
                    game.quiz_game_questions.map((q) => ({
                        id: q.id,
                        question: q.question,
                        options: {
                            A: q.option_a,
                            B: q.option_b,
                            C: q.option_c,
                            ...(q.option_d && { D: q.option_d }),
                        },
                        correctAnswer: q.correct_answer,
                    }))
                ),
            };

        case 'puzzle':
            return gameTypeData.puzzle_games.map((game) => ({
                id: game.id,
                imageurl: game.imageurl,
                pieces: game.puzzle_pieces.map((piece) => ({
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
                cardsData: game.treasure_cards.map((card) => ({
                    type: card.type,
                    value: card.value,
                    matchGroup: card.match_group,
                })),
            }));

        default:
            throw new Error('Unsupported game type');
    }
}

module.exports = {
    getGameData,
};

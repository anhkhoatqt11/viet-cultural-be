const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

async function getGameData(regionId, gameType) {
    const gameTypeData = await db.game_types.findUnique({
        where: { code: gameType },
        include: {
            word_games: {
                where: { region_id: Number(regionId) },
                // Include the letter relations for word games
                include: {
                    word_games_correct_letters: true,
                    word_games_letters: true,
                }
            },
            quiz_games: {
                where: { regionid_id: Number(regionId) },
                include: { quiz_game_questions: true },
            },
            puzzle_games: {
                where: { regionid_id: Number(regionId) },
                include: {
                    puzzle_pieces: {
                        include: { media: true } // Include media for each piece
                    },
                    media: true, // Include media for the main puzzle image
                    puzzle_games_answer: true // Include the answers relation
                },
            },
            treasure_games: {
                where: { region_id: Number(regionId) },
                include: {
                    treasure_cards: {
                        include: { media: true } // Include media for each card
                    }
                },
            },
        },
    });

    if (!gameTypeData) {
        throw new Error('Game type not found');
    }

    switch (gameTypeData.code) {
        case 'word':
            // Map over word games and extract letters from relations
            return gameTypeData.word_games.map((game) => ({
                id: game.id,
                question: game.question,
                hint: game.hint,
                answer: game.answer,
                // Extract letters from the included relations
                correct_letters: game.word_games_correct_letters.map(l => l.letter),
                letters: game.word_games_letters.map(l => l.letter),
            }));

        case 'quiz':
            // Flatten the questions from all quiz games in the region
            return {
                // Return an array of questions directly as per your previous structure
                question: gameTypeData.quiz_games.flatMap((game) =>
                    game.quiz_game_questions.map((q) => ({
                        id: q.id,
                        question: q.question,
                        options: {
                            A: q.option_a,
                            B: q.option_b,
                            C: q.option_c,
                            ...(q.option_d && { D: q.option_d }), // Include D only if it exists
                        },
                        correctAnswer: q.correct_answer,
                        audioUrl: q.audio_url,
                    }))
                ),
            };

        case 'puzzle':
            return gameTypeData.puzzle_games.map((game) => ({
                id: game.id,
                imageUrl: game.media && game.media.key ? `${IMAGE_BASE_URL}${game.media.key}` : null,
                hint: game.hint,
                pieces: game.puzzle_pieces.map((piece) => ({
                    id: piece.id,
                    piece_index: piece.piece_index,
                    // Removed x_position, y_position, correct_x, correct_y as they are not in the schema
                    imageUrl: piece.media && piece.media.key ? `${IMAGE_BASE_URL}${piece.media.key}` : null,
                })),
                // Map over the included answers
                answers: game.puzzle_games_answer.map((answer) => ({
                    id: answer.id,
                    index: answer.index
                })),
                answer_text: game.answer_text
            }));

        case 'treasure':
            return gameTypeData.treasure_games.map((game) => ({
                id: game.id,
                title: game.title,
                description: game.description,
                cardsData: game.treasure_cards.map((card) => ({
                    id: card.id,
                    type: card.type,
                    value: card.value,
                    matchGroup: card.match_group,
                    imageUrl: card.media && card.media.key ? `${IMAGE_BASE_URL}${card.media.key}` : null,
                })),
            }));

        default:
            throw new Error('Unsupported game type');
    }
}

module.exports = {
    getGameData,
};
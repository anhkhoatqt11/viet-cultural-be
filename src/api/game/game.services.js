const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

async function getGameData(regionId, gameType) {
    const gameTypeData = await db.game_types.findUnique({
        where: { code: gameType },
        include: {
            word_games: {
                where: { region_id: Number(regionId) },
            },
            quiz_games: {
                where: { regionid_id: Number(regionId) },
                include: { quiz_game_questions: true },
            },
            puzzle_games: {
                where: { regionid_id: Number(regionId) },
                include: {
                    puzzle_pieces: {
                        include: { media: true }
                    },
                    media: true
                },
            },
            treasure_games: {
                where: { region_id: Number(regionId) },
                include: {
                    treasure_cards: {
                        include: { media: true }
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
                    x_position: piece.x_position,
                    y_position: piece.y_position,
                    correct_x: piece.correct_x,
                    correct_y: piece.correct_y,
                    imageUrl: piece.media && piece.media.key ? `${IMAGE_BASE_URL}${piece.media.key}` : null,
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
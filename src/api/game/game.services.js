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

async function updateGameHistory(userId, gameTypeId, gameId, gameType, completed = false) {
    // Get the current timestamp
    const currentTime = new Date();

    // Prepare the data to be updated or created
    const updateData = completed
        ? { completed_time: currentTime }
        : { started_time: currentTime };
    // Prepare the where condition based on game type and userId
    const whereCondition = {
        game_type_id_id: Number(gameTypeId),
        user_id_id: Number(userId), // Include userId in the where condition
        AND: {}
    };

    // Add game specific ID to where condition based on game type
    switch (gameType) {
        case 'word':
            whereCondition.AND.word_game_id_id = Number(gameId);
            break;
        case 'quiz':
            whereCondition.AND.quiz_game_id_id = Number(gameId);
            break;
        case 'puzzle':
            whereCondition.AND.puzzle_game_id_id = Number(gameId);
            break;
        case 'treasure':
            whereCondition.AND.treasure_game_id_id = Number(gameId);
            break;
        default:
            throw new Error('Unsupported game type');
    }

    // Try to find an existing history record for this user and game
    const existingHistory = await db.game_history.findFirst({
        where: whereCondition
    });

    if (existingHistory) {
        // Update existing record
        return await db.game_history.update({
            where: { id: existingHistory.id },
            data: updateData
        });
    } else {
        // Create new record with all required data
        const createData = {
            game_type_id_id: Number(gameTypeId),
            user_id_id: Number(userId), // Add the user ID to createData
            ...updateData
        };

        // Add specific game ID field based on game type
        switch (gameType) {
            case 'word':
                createData.word_game_id_id = Number(gameId);
                break;
            case 'quiz':
                createData.quiz_game_id_id = Number(gameId);
                break;
            case 'puzzle':
                createData.puzzle_game_id_id = Number(gameId);
                break;
            case 'treasure':
                createData.treasure_game_id_id = Number(gameId);
                break;
        }

        return await db.game_history.create({ data: createData });
    }
}


async function getGameHistory(userId, gameType = null) {
    const whereCondition = {
        user_id_id: Number(userId)
    };

    // If gameType is provided, add game type filter
    if (gameType) {
        // Get the game type ID
        const gameTypeRecord = await db.game_types.findUnique({
            where: { code: gameType }
        });

        if (!gameTypeRecord) {
            throw new Error('Game type not found');
        }

        whereCondition.game_type_id_id = gameTypeRecord.id;
    }

    // Fetch game history with related game data
    const gameHistory = await db.game_history.findMany({
        where: whereCondition,
        include: {
            game_types: true, // Include game type info
            // Include specific game info based on type
            word_games: true,
            puzzle_games_game_history_puzzle_game_id_idTopuzzle_games: true,
            puzzle_games_game_history_quiz_game_id_idTopuzzle_games: true,
            treasure_games: true
        },
        orderBy: {
            created_at: 'desc' // Most recent first
        }
    });

    // Transform the result to include game-specific data
    return gameHistory.map(history => {
        const result = {
            id: history.id,
            gameType: history.game_types?.code,
            gameTypeName: history.game_types?.name,
            startedTime: history.started_time,
            completedTime: history.completed_time,
            createdAt: history.created_at,
            updatedAt: history.updated_at
        };

        // Add game-specific data based on game type
        if (history.game_types?.code === 'word' && history.word_games) {
            result.gameData = {
                id: history.word_games.id,
                question: history.word_games.question,
                answer: history.word_games.answer
            };
        } else if (history.game_types?.code === 'puzzle' &&
            (history.puzzle_games_game_history_puzzle_game_id_idTopuzzle_games ||
                history.puzzle_games_game_history_quiz_game_id_idTopuzzle_games)) {
            const puzzleGame = history.puzzle_games_game_history_puzzle_game_id_idTopuzzle_games ||
                history.puzzle_games_game_history_quiz_game_id_idTopuzzle_games;
            result.gameData = {
                id: puzzleGame.id,
                hint: puzzleGame.hint
            };
        } else if (history.game_types?.code === 'treasure' && history.treasure_games) {
            result.gameData = {
                id: history.treasure_games.id,
                title: history.treasure_games.title
            };
        }

        return result;
    });
}

module.exports = {
    getGameData,
    updateGameHistory,
    getGameHistory,
};


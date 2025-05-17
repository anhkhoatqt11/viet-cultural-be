const { db } = require('../../utils/db');

/**
 * Create a new history record
 * @param {Object} data - The history data
 * @returns {Promise<Object>} Created history record
 */
function createHistory(data) {
    return db.history.create({
        data: {
            game_type_id_id: data.gameTypeId,
            user_id_id: data.userId,
            region_id_id: data.regionId,
            description: data.description,
            started_time: data.started_time || new Date(),
        },
    });
}

/**
 * Update the completed_time of a history record
 * @param {number} id - History ID
 * @param {Object} data - Data with completed_time
 * @returns {Promise<Object>} Updated history record
 */
function updateCompletedTime(id, data) {
    return db.history.update({
        where: {
            id,
        },
        data: {
            completed_time: data.completed_time || new Date(),
            updated_at: new Date()
        },
    });
}

/**
 * Find history record by ID
 * @param {number} id - History ID
 * @returns {Promise<Object>} History record
 */
function findHistoryById(id) {
    return db.history.findUnique({
        where: {
            id,
        },
    });
}

/**
 * Find all history records for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of history records
 */
function findHistoryByUserId(userId) {
    return db.history.findMany({
        where: {
            user_id_id: userId,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
}

/**
 * Create a history record and update its completed_time in one request
 * @param {Object} data - History data with completed_time
 * @returns {Promise<Object>} Updated history record
 */
async function createAndCompleteHistory(data) {
    // First create the history record
    const history = await createHistory(data);
    
    // Then update its completed_time
    return updateCompletedTime(history.id, {
        completed_time: data.completed_time || new Date()
    });
}

module.exports = {
    createHistory,
    updateCompletedTime,
    findHistoryById,
    findHistoryByUserId,
    createAndCompleteHistory,
};
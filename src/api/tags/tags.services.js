const { db } = require('../../utils/db');

/**
 * Get all tags from database
 * @returns {Promise<Array>} Array of tag objects
 */
async function getAllTags() {
    try {
        const tags = await db.tags.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return tags;
    } catch (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }
}

/**
 * Get a single tag by ID
 * @param {number} id - The tag ID
 * @returns {Promise<Object|null>} Tag object or null if not found
 */
async function getTagById(id) {
    try {
        const tag = await db.tags.findUnique({
            where: { id: Number(id) }
        });
        return tag;
    } catch (error) {
        console.error(`Error fetching tag with ID ${id}:`, error);
        throw error;
    }
}

/**
 * Get all posts associated with a specific tag
 * @param {number} tagId - The tag ID
 * @returns {Promise<Array>} Array of post objects with the tag
 */
async function getPostsByTagId(tagId) {
    try {
        const postRels = await db.posts_rels.findMany({
            where: { 
                tags_id: Number(tagId) 
            },
            include: {
                posts: {
                    include: {
                        media: true,
                        user: true
                    }
                }
            }
        });

        // Format posts with imageUrl
        const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';
        return postRels.map(rel => ({
            ...rel.posts,
            imageUrl: rel.posts.media && rel.posts.media.key ? 
                `${IMAGE_BASE_URL}${rel.posts.media.key}` : null
        }));
    } catch (error) {
        console.error(`Error fetching posts for tag ID ${tagId}:`, error);
        throw error;
    }
}

module.exports = {
    getAllTags,
    getTagById,
    getPostsByTagId
};
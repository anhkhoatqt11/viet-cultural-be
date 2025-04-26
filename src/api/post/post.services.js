const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

async function createPost(post) {
    // Extract userId and tags if provided
    const { userId, tags, ...postData } = post;

    // Create transaction to ensure post and tag relations are created atomically
    return await db.$transaction(async (tx) => {
        // Create the post first
        const createdPost = await tx.posts.create({
            data: {
                ...postData,
                // Map userId to user_id_id
                user_id_id: userId ? Number(userId) : undefined,
                // If an image_id is provided as string, convert to number
                image_id: post.image_id ? Number(post.image_id) : undefined
            },
            include: {
                media: true,
                user: true
            }
        });

        // If tags are provided, create the post_rels entries
        if (tags && Array.isArray(tags) && tags.length > 0) {
            // Create tag relations for each tag
            for (const tagId of tags) {
                await tx.posts_rels.create({
                    data: {
                        parent_id: createdPost.id,
                        tags_id: Number(tagId),
                        path: 'tags', // Standard path for tag relations
                    }
                });
            }
        }

        // Fetch the complete post with tags
        const postWithTags = await tx.posts.findUnique({
            where: { id: createdPost.id },
            include: {
                media: true,
                user: true,
                posts_rels: {
                    include: {
                        tags: true
                    }
                }
            }
        });

        // Format the response
        return {
            ...postWithTags,
            imageUrl: postWithTags.media && postWithTags.media.key ?
                `${IMAGE_BASE_URL}${postWithTags.media.key}` : null,
            user: postWithTags.user ? {
                id: postWithTags.user.id,
                full_name: postWithTags.user.full_name,
                avatar_url: postWithTags.user.avatar_url,
                avatarUrl: postWithTags.user.avatar ?
                    `${IMAGE_BASE_URL}${postWithTags.user.avatar}` : null
            } : null,
            tags: postWithTags.posts_rels.map(rel => rel.tags).filter(Boolean)
        };
    });
}
async function getPostById(id) {
    id = Number(id);

    const post = await db.posts.findUnique({
        where: { id },
        include: {
            media: true,
            user: true,
            posts_rels: true
        },
    });

    if (!post) return null;

    // Count likes (posts_rels with path='likedBy')
    const likeCount = post.posts_rels.filter(rel => rel.path === 'likedBy').length;

    // Get tags
    const tags = await db.posts_rels.findMany({
        where: {
            parent_id: id,
            path: 'tags'
        },
        include: {
            tags: true
        }
    });

    return {
        ...post,
        imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
        user: post.user ? {
            id: post.user.id,
            full_name: post.user.full_name,
            avatar_url: post.user.avatar_url,
            avatarUrl: post.user.avatar ? `${IMAGE_BASE_URL}${post.user.avatar}` : null
        } : null,
        likeCount,
        tags: tags.map(rel => rel.tags).filter(Boolean)
    };
}

async function getAllPosts(options = {}) {
    // Extract pagination and search parameters with defaults
    const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'created_at',
        sortOrder = 'desc'
    } = options;

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    // Build where conditions for searching in title and question fields
    const whereCondition = search
        ? {
            OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { question: { contains: search, mode: 'insensitive' } }
            ]
        }
        : {};

    // Get total count for pagination
    const totalCount = await db.posts.count({ where: whereCondition });
    
    // Get posts with pagination
    const posts = await db.posts.findMany({
        where: whereCondition,
        skip,
        take,
        include: {
            media: true,
            user: true,
            posts_rels: true,
            comments: {
                take: 3, // Get only the 3 most recent comments for preview
                orderBy: { created_at: 'desc' },
                include: { user: true }
            },
            _count: {
                select: { comments: true }
            }
        },
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    // Format the response data
    const formattedPosts = posts.map(post => {
        // Count likes (posts_rels with path='likedBy')
        const likeCount = post.posts_rels.filter(rel => rel.path === 'likedBy').length;

        // Format comments for preview
        const formattedComments = post.comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            likes: comment.likes,
            dislikes: comment.dislikes,
            created_at: comment.created_at,
            user: comment.user ? {
                id: comment.user.id,
                full_name: comment.user.full_name,
                avatar_url: comment.user.avatar_url,
                avatarUrl: comment.user.avatar ? `${IMAGE_BASE_URL}${comment.user.avatar}` : null
            } : null
        }));

        return {
            id: post.id,
            title: post.title,
            question: post.question,
            created_at: post.created_at,
            updated_at: post.updated_at,
            imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
            user: post.user ? {
                id: post.user.id,
                full_name: post.user.full_name,
                avatar_url: post.user.avatar_url,
                avatarUrl: post.user.avatar ? `${IMAGE_BASE_URL}${post.user.avatar}` : null
            } : null,
            likeCount,
            commentCount: post._count.comments,
            comments: formattedComments
        };
    });

    return {
        posts: formattedPosts,
        pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / limit)
        }
    };
}

async function commentPost(postId, comment) {
    const createdComment = await db.comments.create({
        data: {
            ...comment,
            post_id_id: postId,
        },
        include: {
            posts: {
                include: {
                    media: true,
                    user: true
                },
            },
        },
    });

    // Format post with imageUrl
    const post = createdComment.posts;
    const formattedPost = post
        ? {
            ...post,
            imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
            user: post.user ? {
                id: post.user.id,
                full_name: post.user.full_name,
                avatar_url: post.user.avatar_url,
                avatarUrl: post.user.avatar ? `${IMAGE_BASE_URL}${post.user.avatar}` : null
                // Only include non-confidential fields
            } : null
        }
        : null;

    return {
        ...createdComment,
        post: formattedPost,
    };
}

// Adding dedicated functions for liking and unliking posts
async function likePost(postId, userId) {
    // Convert IDs to numbers for consistency
    postId = Number(postId);
    userId = Number(userId);

    // Check if post exists
    const post = await db.posts.findUnique({
        where: { id: postId }
    });

    if (!post) {
        throw new Error('Post not found');
    }

    // Check if user already liked this post
    const existingLike = await db.posts_rels.findFirst({
        where: {
            parent_id: postId,
            user_id: userId,
            path: 'likedBy'
        }
    });

    if (existingLike) {
        // User already liked the post
        throw new Error('Post already liked by user');
    }

    // User hasn't liked the post yet, so like it
    await db.posts_rels.create({
        data: {
            parent_id: postId,
            user_id: userId,
            path: 'likedBy'
        }
    });

    // Get updated like count
    const likeCount = await db.posts_rels.count({
        where: {
            parent_id: postId,
            path: 'likedBy'
        }
    });

    return {
        liked: true,
        likeCount,
        message: 'Post liked successfully'
    };
}

async function unlikePost(postId, userId) {
    // Convert IDs to numbers for consistency
    postId = Number(postId);
    userId = Number(userId);

    // Check if post exists
    const post = await db.posts.findUnique({
        where: { id: postId }
    });

    if (!post) {
        throw new Error('Post not found');
    }

    // Check if user already liked this post
    const existingLike = await db.posts_rels.findFirst({
        where: {
            parent_id: postId,
            user_id: userId,
            path: 'likedBy'
        }
    });

    if (!existingLike) {
        // User hasn't liked the post
        throw new Error('Post not liked by user');
    }

    // Unlike the post
    await db.posts_rels.delete({
        where: { id: existingLike.id }
    });

    // Get updated like count
    const likeCount = await db.posts_rels.count({
        where: {
            parent_id: postId,
            path: 'likedBy'
        }
    });

    return {
        liked: false,
        likeCount,
        message: 'Post unliked successfully'
    };
}

/**
 * Check if a user has liked a post
 */
async function isPostLikedByUser(postId, userId) {
    // Convert IDs to numbers for consistency
    postId = Number(postId);
    userId = Number(userId);

    const like = await db.posts_rels.findFirst({
        where: {
            parent_id: postId,
            user_id: userId,
            path: 'likedBy'
        }
    });

    return !!like; // Convert to boolean
}

/**
 * Get list of users who liked a post
 */
async function getLikesByPostId(postId) {
    postId = Number(postId);

    const likes = await db.posts_rels.findMany({
        where: {
            parent_id: postId,
            path: 'likedBy'
        },
        include: {
            user: true
        }
    });

    // Format the response to only include non-sensitive user data
    return likes.map(like => ({
        id: like.id,
        userId: like.user_id,
        user: like.user ? {
            id: like.user.id,
            full_name: like.user.full_name,
            avatar_url: like.user.avatar_url,
            avatarUrl: like.user.avatar ? `${IMAGE_BASE_URL}${like.user.avatar}` : null
        } : null
    }));
}

module.exports = {
    createPost,
    getPostById,
    getAllPosts,
    commentPost,
    likePost,
    unlikePost,
    isPostLikedByUser,
    getLikesByPostId
};
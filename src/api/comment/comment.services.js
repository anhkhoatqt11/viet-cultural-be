const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

const Comment = db.comments;
const CommentsRels = db.comments_rels;

const createComment = async (commentData) => {
    // Map API field names to database field names
    return await Comment.create({
        data: {
            content: commentData.content,
            // Use only the database field names, not the API names
            user_id_id: commentData.userId ? Number(commentData.userId) : null,
            post_id_id: commentData.postId ? Number(commentData.postId) : null,
            parent_id_id: commentData.parentId ? Number(commentData.parentId) : null,
        }
    });
};

const getCommentById = async (id) => {
    const comment = await Comment.findUnique({
        where: { id: parseInt(id) },
        include: {
            user: true,
            posts: {
                include: { media: true }
            }
        }
    });

    if (!comment) return null;

    // Replies
    const replies = await Comment.findMany({
        where: { parent_id_id: parseInt(id) },
        include: {
            user: true
        }
    });

    // Get like count from comments_rels
    const likeCount = await CommentsRels.count({
        where: {
            parent_id: parseInt(id),
            path: 'likedBy'
        }
    });

    // Format post with imageUrl
    const post = comment.posts;
    const formattedPost = post
        ? {
            ...post,
            imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
        }
        : null;

    return {
        ...comment,
        likes: likeCount,
        post: formattedPost,
        replies: replies
    };
};

const updateComment = async (id, commentData) => {
    // Map API field names to database field names for update
    const updateData = {};
    
    if (commentData.content !== undefined) {
        updateData.content = commentData.content;
    }
    
    // Only set these fields if they are provided
    if (commentData.parentId !== undefined) {
        updateData.parent_id_id = commentData.parentId ? Number(commentData.parentId) : null;
    }

    return await Comment.update({
        where: { id: parseInt(id) },
        data: updateData
    });
};

const deleteComment = async (id) => {
    return await Comment.delete({
        where: { id: parseInt(id) }
    });
};

const likeComment = async (commentId, userId) => {
    const comment = await Comment.findUnique({
        where: { id: parseInt(commentId) }
    });
    if (!comment) {
        throw new Error('Bình luận không tồn tại');
    }
    
    const existingLike = await CommentsRels.findFirst({
        where: {
            parent_id: parseInt(commentId),
            user_id: parseInt(userId),
            path: 'likedBy'
        }
    });

    if (existingLike) {
        // Un-like
        await CommentsRels.delete({
            where: { id: existingLike.id }
        });
        
        // Get updated like count
        const likeCount = await CommentsRels.count({
            where: {
                parent_id: parseInt(commentId),
                path: 'likedBy'
            }
        });
        
        return { message: "Đã bỏ thích bình luận", likes: likeCount };
    } else {
        // Add like
        await CommentsRels.create({
            data: {
                parent_id: parseInt(commentId),
                user_id: parseInt(userId),
                path: 'likedBy'
            }
        });
        
        // Get updated like count
        const likeCount = await CommentsRels.count({
            where: {
                parent_id: parseInt(commentId),
                path: 'likedBy'
            }
        });
        
        return { message: "Đã thích bình luận", likes: likeCount };
    }
};

const dislikeComment = async (commentId, userId) => {
    const comment = await Comment.findUnique({
        where: { id: parseInt(commentId) }
    });
    if (!comment) {
        throw new Error('Bình luận không tồn tại');
    }
    
    const existingLike = await CommentsRels.findFirst({
        where: {
            parent_id: parseInt(commentId),
            user_id: parseInt(userId),
            path: 'likedBy'
        }
    });

    // We're removing the dislikeComment functionality since we're only using likes
    // Just remove the like if it exists, same as unlikeComment
    if (existingLike) {
        await CommentsRels.delete({
            where: { id: existingLike.id }
        });
        
        const likeCount = await CommentsRels.count({
            where: {
                parent_id: parseInt(commentId),
                path: 'likedBy'
            }
        });
        
        return { message: "Đã bỏ thích bình luận", likes: likeCount };
    }
    
    return { message: "Chưa thích bình luận này", likes: 0 };
};

const getCommentsByPostId = async (postId) => {
    // Get top-level comments (ones without a parent)
    const comments = await Comment.findMany({
        where: { 
            post_id_id: parseInt(postId),
            parent_id_id: null 
        },
        include: {
            user: true,
            other_comments: {
                include: {
                    user: true
                }
            },
            comments_rels: {
                where: {
                    path: 'likedBy'
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    // Format the comments and their replies
    const formattedComments = await Promise.all(comments.map(async (comment) => {
        // Get replies with their likes
        const formattedReplies = await Promise.all(comment.other_comments.map(async (reply) => {
            const replyLikes = await CommentsRels.count({
                where: {
                    parent_id: reply.id,
                    path: 'likedBy'
                }
            });
            
            return {
                ...reply,
                likes: replyLikes,
                // Format user data if needed
                user: reply.user ? {
                    ...reply.user,
                    avatarUrl: reply.user.avatar_url
                } : null,
            };
        }));

        // Count likes from comments_rels
        const likeCount = comment.comments_rels.length;

        return {
            ...comment,
            likes: likeCount,
            // Format user data if needed
            user: comment.user ? {
                ...comment.user,
                avatarUrl: comment.user.avatar_url
            } : null,
            replies: formattedReplies
        };
    }));

    return formattedComments;
};

/**
 * Check if a user has liked a specific comment
 * @param {number} commentId - The comment ID
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - True if the user liked the comment, false otherwise
 */
const isCommentLikedByUser = async (commentId, userId) => {
    const like = await CommentsRels.findFirst({
        where: {
            parent_id: Number(commentId),
            user_id: Number(userId),
            path: 'likedBy'
        }
    });

    return !!like; // Convert to boolean (true if like exists, false if not)
};


const unlikeComment = async (commentId, userId) => {
    const comment = await Comment.findUnique({
        where: { id: parseInt(commentId) }
    });
    
    if (!comment) {
        throw new Error('Bình luận không tồn tại');
    }
    
    const existingLike = await CommentsRels.findFirst({
        where: {
            parent_id: parseInt(commentId),
            user_id: parseInt(userId),
            path: 'likedBy'
        }
    });

    if (!existingLike) {
        // Get current like count
        const likeCount = await CommentsRels.count({
            where: {
                parent_id: parseInt(commentId),
                path: 'likedBy'
            }
        });
        
        return { 
            message: "Chưa thích bình luận này",
            likes: likeCount
        };
    }

    // Delete the like reaction
    await CommentsRels.delete({
        where: { id: existingLike.id }
    });
    
    // Get updated like count
    const updatedLikeCount = await CommentsRels.count({
        where: {
            parent_id: parseInt(commentId),
            path: 'likedBy'
        }
    });
    
    return { 
        message: "Đã bỏ thích bình luận", 
        likes: updatedLikeCount
    };
};

module.exports = {
    createComment,
    getCommentById,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    getCommentsByPostId,
    isCommentLikedByUser,
    unlikeComment
};
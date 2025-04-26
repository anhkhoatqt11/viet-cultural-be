const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

const Comment = db.comments;
const CommentReaction = db.comment_reactions;

const createComment = async (commentData) => {
    // Map API field names to database field names
    return await Comment.create({
        data: {
            content: commentData.content,
            likes: commentData.likes || 0,
            dislikes: commentData.dislikes || 0,
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
    const existingReaction = await CommentReaction.findFirst({
        where: {
            comment_id: parseInt(commentId),
            user_id: parseInt(userId)
        }
    });

    if (existingReaction) {
        if (existingReaction.reaction_type === "Like") {
            // Un-like
            await CommentReaction.delete({
                where: { id: existingReaction.id }
            });
            await Comment.update({
                where: { id: parseInt(commentId) },
                data: { likes: { decrement: 1 } }
            });
            return { message: "Đã bỏ thích bình luận", likes: comment.likes - 1 };
        } else if (existingReaction.reaction_type === "Dislike") {
            // Switch from dislike to like
            await CommentReaction.update({
                where: { id: existingReaction.id },
                data: { reaction_type: "Like" }
            });
            await Comment.update({
                where: { id: parseInt(commentId) },
                data: {
                    likes: { increment: 1 },
                    dislikes: { decrement: 1 }
                }
            });
            return {
                message: "Đã chuyển thành thích bình luận",
                likes: comment.likes + 1,
                dislikes: comment.dislikes - 1
            };
        }
    } else {
        await CommentReaction.create({
            data: {
                comment_id: parseInt(commentId),
                user_id: parseInt(userId),
                reaction_type: "Like"
            }
        });
        await Comment.update({
            where: { id: parseInt(commentId) },
            data: { likes: { increment: 1 } }
        });
        return { message: "Đã thích bình luận", likes: comment.likes + 1 };
    }
};

const dislikeComment = async (commentId, userId) => {
    const comment = await Comment.findUnique({
        where: { id: parseInt(commentId) }
    });

    const existingReaction = await CommentReaction.findFirst({
        where: {
            comment_id: parseInt(commentId),
            user_id: parseInt(userId)
        }
    });

    if (existingReaction) {
        if (existingReaction.reaction_type === "Dislike") {
            await CommentReaction.delete({
                where: { id: existingReaction.id }
            });
            await Comment.update({
                where: { id: parseInt(commentId) },
                data: { dislikes: { decrement: 1 } }
            });
            return { message: "Đã bỏ dislike bình luận", dislikes: comment.dislikes - 1 };
        } else if (existingReaction.reaction_type === "Like") {
            await CommentReaction.update({
                where: { id: existingReaction.id },
                data: { reaction_type: "Dislike" }
            });
            await Comment.update({
                where: { id: parseInt(commentId) },
                data: {
                    likes: { decrement: 1 },
                    dislikes: { increment: 1 }
                }
            });
            return {
                message: "Đã chuyển thành dislike bình luận",
                dislikes: comment.dislikes + 1,
                likes: comment.likes - 1
            };
        }
    } else {
        await CommentReaction.create({
            data: {
                comment_id: parseInt(commentId),
                user_id: parseInt(userId),
                reaction_type: "Dislike"
            }
        });
        await Comment.update({
            where: { id: parseInt(commentId) },
            data: { dislikes: { increment: 1 } }
        });
        return { message: "Đã dislike bình luận", dislikes: comment.dislikes + 1 };
    }
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
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    // Format the comments and their replies
    const formattedComments = comments.map(comment => {
        const formattedReplies = comment.other_comments.map(reply => ({
            ...reply,
            // Format user data if needed
            user: reply.user ? {
                ...reply.user,
                avatarUrl: reply.user.avatar_url
            } : null,
        }));

        return {
            ...comment,
            // Format user data if needed
            user: comment.user ? {
                ...comment.user,
                avatarUrl: comment.user.avatar_url
            } : null,
            replies: formattedReplies
        };
    });

    return formattedComments;
};

/**
 * Check if a user has liked a specific comment
 * @param {number} commentId - The comment ID
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - True if the user liked the comment, false otherwise
 */
const isCommentLikedByUser = async (commentId, userId) => {
    const reaction = await CommentReaction.findFirst({
        where: {
            comment_id: Number(commentId),
            user_id: Number(userId),
            reaction_type: "Like" // Only check for Like reactions
        }
    });

    return !!reaction; // Convert to boolean (true if reaction exists, false if not)
};

module.exports = {
    createComment,
    getCommentById,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    getCommentsByPostId,
    isCommentLikedByUser
};
const { db } = require('../../utils/db');

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

function createPost(post) {
    return db.posts.create({
        data: post,
    });
}

async function getPostById(id) {
    const post = await db.posts.findUnique({
        where: { id },
        include: { 
            media: true,
            user: true 
        },
    });
    if (!post) return null;
    return {
        ...post,
        imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
        user: post.user ? {
            id: post.user.id,
            full_name: post.user.full_name,
            avatar_url: post.user.avatar_url,
            avatarUrl: post.user.avatar ? `${IMAGE_BASE_URL}${post.user.avatar}` : null
            // Only include non-confidential fields
        } : null
    };
}

async function getAllPosts() {
    const posts = await db.posts.findMany({
        include: { 
            media: true,
            user: true 
        },
    });
    return posts.map(post => ({
        ...post,
        imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
        user: post.user ? {
            id: post.user.id,
            full_name: post.user.full_name,
            avatar_url: post.user.avatar_url,
            avatarUrl: post.user.avatar ? `${IMAGE_BASE_URL}${post.user.avatar}` : null
            // Only include non-confidential fields
        } : null
    }));
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

module.exports = {
    createPost,
    getPostById,
    getAllPosts,
    commentPost,
};
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
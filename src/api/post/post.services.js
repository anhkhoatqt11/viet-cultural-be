const { db } = require('../../utils/db');

function createPost(post) {
    return db.post.create({
        data: post,
    });
}

function getPostById(id) {
    return db.post.findUnique({
        where: {
            id,
        },
    });
}

function getAllPosts() {
    return db.post.findMany();
}

function commentPost(postId, comment) {
    return db.comment.create({
        data: {
            ...comment,
            postId,
        },
    });
}


module.exports = {
    createPost,
    getPostById,
    getAllPosts,
    commentPost,
};
const { db } = require('../../utils/db');

function createPost(post) {
    return db.posts.create({
        data: post,
    });
}

function getPostById(id) {
    return db.posts.findUnique({
        where: {
            id,
        },
    });
}

function getAllPosts() {
    return db.posts.findMany();
}

function commentPost(postId, comment) {
    return db.comments.create({
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
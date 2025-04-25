const { skip } = require('@prisma/client/runtime/library')
const { db } = require('../../utils/db')

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/'

async function getPostById(id) {
    return await db.knowledge_post.findUnique({
        where: {
            id: id
        },
        
    })
}

async function getPostsByType({postType, page = 1, limit = 10}) {
    const offset = (page - 1) * limit
    const posts = await db.knowledge_post.findMany({
        where: {
            post_type: postType
        },
        include: {
            media: true
        },
        skip: offset,
        take: limit
    })
    const total = await db.knowledge_post.count({
        where: {
            post_type: postType
        }
    })
    const totalPages = Math.ceil(total / limit)
    return {
        posts: posts.map(post => ({ 
            ...post,
            imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
        })),
        total,
        totalPages,
        page,
        limit
    }
}

async function getPostsBySubject({subject, page = 1, limit = 10}) {
    const offset = (page - 1) * limit
    const posts = await db.knowledge_post.findMany({
        where: {
            subject: subject
        },
        include: {
            media: true
        },
        skip: offset,
        take: limit
    })  
    
    const total = await db.knowledge_post.count({
        where: {
            subject: subject
        }
    })
    const totalPages = Math.ceil(total / limit)
    return {
        posts: posts.map(post => ({ 
            ...post,
            imageUrl: post.media && post.media.key ? `${IMAGE_BASE_URL}${post.media.key}` : null,
        })),
        total,
        totalPages,
        page,
        limit
    }
}

module.exports = {
    getPostById,
    getPostsBySubject,
    getPostsByType
}
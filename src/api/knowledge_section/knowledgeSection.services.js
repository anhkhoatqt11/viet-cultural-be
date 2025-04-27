const { db } = require('../../utils/db')

const IMAGE_BASE_URL = 'https://qauff8c31y.ufs.sh/f/';

const getAllSections = async () => {
    const sections = await db.knowledge_section.findMany({
        include: {
            knowledge_section_items: {
                include: {
                    media: true
                }
            }
        }
    })

    return sections.map(section => ({
        id: section.id,
        title: section.title,
        items: section.knowledge_section_items.map((item) => ({
            name: item.name,
            imageUrl: item.media && item.media.key ? `${IMAGE_BASE_URL}${item.media.key}` : null,
        }))
    }))
}

const getSectionById = async (id) => {
    return await db.knowledge_section.findUnique({
        where: {
            id: id
        },
        include: {
            knowledge_section_items: {
                include: {
                    media: true
                }
            }
        }
    })
}


module.exports = {
    getAllSections,
    getSectionById
}
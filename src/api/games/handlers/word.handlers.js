const {db} = require('../../../utils/db')

class WordHandler {
    async getAll(){
        return await db.wordGame.findMany()
    }

    async getById(id){
        return await db.wordGame.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.wordGame.create({
            ...data
        })
    }

    async update(id, data){
        return await db.wordGame.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.wordGame.delete({
            where: {
                id: id
            }
        })
    }
}

module.exports = WordHandler


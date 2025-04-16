const {db} = require('../../../utils/db')

class WordHandler {
    async getAll(){
        return await db.word_games.findMany()
    }

    async getById(id){
        return await db.word_games.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.word_games.create({
            ...data
        })
    }

    async update(id, data){
        return await db.word_games.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.word_games.delete({
            where: {
                id: id
            }
        })
    }
}

module.exports = WordHandler


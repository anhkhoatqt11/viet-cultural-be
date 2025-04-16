const {db} = require('../../../utils/db')

class TreasureHandler {
    async getAll(){
        return await db.treasureGame.findMany()
    }

    async getById(id){
        return await db.treasureGame.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.treasureGame.create({
            ...data
        })
    }

    async update(id, data){
        return await db.treasureGame.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.treasureGame.delete({
            where: {
                id: id
            }
        })
    }
}

class TreasureCardHandler {
    async getAll(id){
        return await db.treasureCard.findMany({
            where: {
                treasureId: id
            }
        })
    }

    async getById(id){
        return await db.treasureCard.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.treasureCard.create({
            ...data
        })
    }

    async update(id, data){
        return await db.treasureCard.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.treasureCard.delete({
            where: {
                id: id
            }
        })
    }
}

module.exports = {
    TreasureHandler,
    TreasureCardHandler
}


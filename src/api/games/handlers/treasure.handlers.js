const {db} = require('../../../utils/db')

class TreasureHandler {
    async getAll(){
        return await db.treasure_games.findMany()
    }

    async getById(id){
        return await db.treasure_games.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.treasure_games.create({
            ...data
        })
    }

    async update(id, data){
        return await db.treasure_games.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.treasure_games.delete({
            where: {
                id: id
            }
        })
    }
}

class TreasureCardHandler {
    async getAll(id){
        return await db.treasure_cards.findMany({
            where: {
                treasureId: id
            }
        })
    }

    async getById(id){
        return await db.treasure_cards.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.treasure_cards.create({
            ...data
        })
    }

    async update(id, data){
        return await db.treasure_cards.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.treasure_cards.delete({
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


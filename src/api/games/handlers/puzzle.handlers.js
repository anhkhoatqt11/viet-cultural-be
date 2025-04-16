const {db} = require('../../../utils/db')

class PuzzleHandler {
    async getAll(){
        return await db.puzzle_games.findMany()
    }

    async getById(id){
        return await db.puzzle_games.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.puzzle_games.create({
            ...data
        })
    }

    async update(id, data){
        return await db.puzzle_games.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.puzzle_games.delete({
            where: {
                id: id
            }
        })
    }
}

class PuzzlePieceHandler {
    async getAll(id){
        return await db.puzzle_pieces.findMany({
            where: {
                puzzleId: id
            }
        })
    }

    async getById(id){
        return await db.puzzle_pieces.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.puzzle_pieces.create({
            ...data
        })
    }

    async update(id, data){
        return await db.puzzle_pieces.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.puzzle_pieces.delete({
            where: {
                id: id
            }
        })
    }
}

module.exports = {
    PuzzleHandler,
    PuzzlePieceHandler
}


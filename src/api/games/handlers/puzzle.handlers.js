const {db} = require('../../../utils/db')

class PuzzleHandler {
    async getAll(){
        return await db.puzzleGame.findMany()
    }

    async getById(id){
        return await db.puzzleGame.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.puzzleGame.create({
            ...data
        })
    }

    async update(id, data){
        return await db.puzzleGame.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.puzzleGame.delete({
            where: {
                id: id
            }
        })
    }
}

class PuzzlePieceHandler {
    async getAll(id){
        return await db.puzzlePiece.findMany({
            where: {
                puzzleId: id
            }
        })
    }

    async getById(id){
        return await db.puzzlePiece.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.puzzlePiece.create({
            ...data
        })
    }

    async update(id, data){
        return await db.puzzlePiece.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.puzzlePiece.delete({
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


const {db} = require('../../../utils/db')

class QuizHandler {
    async getAll(){
        return await db.quizGame.findMany()
    }

    async getById(id){
        return await db.quizGame.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.quizGame.create({
            ...data
        })
    }

    async update(id, data){
        return await db.quizGame.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.quizGame.delete({
            where: {
                id: id
            }
        })
    }
}

class QuizGameQuestionHandler {
    async getAll(id){
        return await db.quizGameQuestion.findMany({
            where: {
                quizId: id
            }
        })
    }

    async getById(id){
        return await db.quizGameQuestion.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.quizGameQuestion.create({
            ...data
        })
    }

    async update(id, data){
        return await db.quizGameQuestion.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.quizGameQuestion.delete({
            where: {
                id: id
            }
        })
    }
}

module.exports = {
    QuizGameQuestionHandler,
    QuizHandler
}


const {db} = require('../../../utils/db')

class QuizHandler {
    async getAll(){
        return await db.quiz_games.findMany()
    }

    async getById(id){
        return await db.quiz_games.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.quiz_games.create({
            ...data
        })
    }

    async update(id, data){
        return await db.quiz_games.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.quiz_games.delete({
            where: {
                id: id
            }
        })
    }
}

class QuizGameQuestionHandler {
    async getAll(id){
        return await db.quiz_game_questions.findMany({
            where: {
                quizId: id
            }
        })
    }

    async getById(id){
        return await db.quiz_game_questions.findUnique({
            where: {
                id: id
            }
        })
    }

    async create(data){
        return await db.quiz_game_questions.create({
            ...data
        })
    }

    async update(id, data){
        return await db.quiz_game_questions.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        })
    }

    async delete(id){
        return await db.quiz_game_questions.delete({
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


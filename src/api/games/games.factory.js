const {PuzzleHandler} = require('./handlers/puzzle.handlers');
const {QuizHandler} = require('./handlers/quiz.handlers');
const {TreasureHandler} = require('./handlers/treasure.handlers');
const WordHandler = require('./handlers/word.handlers');

class GameFactory {
  static getGameHandler(gameType) {
    switch (gameType) {
      case 'puzzle':
        return new PuzzleHandler();
      case 'quiz':
        return new QuizHandler();
      case 'treasure':
        return new TreasureHandler();
      case 'word':
        return new WordHandler();
      default:
        throw new Error('Invalid game type');
    }
  }
}

module.exports = GameFactory;
const express = require('express');
const auth = require('./auth/auth.routes');
const users = require('./user/user.routes');
const region = require('./region/region.routes');
const game = require('./game/game.routes');
const afterInfo = require('./afterInfo/afterInfo.routes');
const post = require('./post/post.routes');
const assistance = require('./assistance/assistance.routes');
const comment = require('./comment/comment.routes');
const tags = require('./tags/tags.routes');

const knowledge_post = require('./knowledge_post/knowledgePost.routes')
const knowledge_section = require('./knowledge_section/knowledgeSection.routes')

const process = require('./process/process.routes')

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', auth);

router.use('/users', users);

router.use('/region', region);

router.use('/game', game);

router.use('/afterInfo', afterInfo);

router.use('/post', post);

router.use('/comment', comment);

router.use('/assistance', assistance)

router.use('/tags', tags);

router.use('/section', knowledge_section)

router.use('/knowledge-post', knowledge_post)

router.use('/process', process)



module.exports = router;

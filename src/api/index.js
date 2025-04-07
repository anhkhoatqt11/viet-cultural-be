const express = require('express');
const auth = require('./auth/auth.routes');
const users = require('./user/user.routes');
const region = require('./region/region.routes');
const game = require('./game/game.routes');
const afterInfo = require('./afterInfo/afterInfo.routes');
const post = require('./post/post.routes');
const assistance = require('./assistance/assistance.routes');
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

router.use('/assistance', assistance)


module.exports = router;

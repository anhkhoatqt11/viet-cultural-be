const express = require('express');
const auth = require('./auth/auth.routes');
const users = require('./user/user.routes');
const destination = require('./destination/destination.routes')
const community = require('./community/community.routes')
const journey = require('./journey/journey.routes')
const assistance = require('./assistance/assistance.routes')
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', auth);

router.use('/users', users);

router.use('/destination', destination)

router.use('/community', community)

router.use('/journey', journey)

router.use('/assistance', assistance)


module.exports = router;

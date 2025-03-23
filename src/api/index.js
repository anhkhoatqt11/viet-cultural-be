const express = require('express');
const auth = require('./auth/auth.routes');
const users = require('./user/user.routes');
const destination = require('./destination/destination.routes')

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/auth', auth);

router.use('/users', users);

router.use('/destination', destination)


module.exports = router;

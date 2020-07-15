const express = require('express');
const nasa = require('./nasa');

const router = express.Router();

router.use('/nasa', nasa);

module.exports = router;

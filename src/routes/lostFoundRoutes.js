const express = require('express');
const router = express.Router();
const controller = require('../controllers/lostFoundController');

router.post('/', controller.postItem);
router.get('/', controller.getItems);

module.exports = router;
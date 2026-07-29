const express = require('express');
const router = express.Router();
const controller = require('../controllers/lostFoundController');
const upload = require('../middleware/upload.js');

router.post('/', upload.single('photo'), controller.postItem);

router.get('/', controller.getItems);

module.exports = router;
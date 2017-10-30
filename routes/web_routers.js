var express = require('express');
var router = express.Router();

var signController = require('../controllers/register');

/* 顯示註冊頁面 */
router.get('/register', signController.showRegister);

/* 提交註冊訊息 */
router.post('/register', signController.register);

module.exports = router;
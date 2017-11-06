var express = require('express');
var router = express.Router();

var signController = require('../controllers/register');
var postController = require('../controllers/post_task');
var acceptController = require('../controllers/accept_task');
var taskController = require('../controllers/task');


router.get('/', function (req, res) {
    res.render('index');
});

/* 顯示註冊頁面 */
router.get('/register', signController.showRegister);

/* 提交註冊訊息 */
router.post('/register', signController.register);

/* 顯示task頁面 */
router.get('/task', taskController.showTask);

/* 提交task訊息 */
router.post('/task', taskController.task);

/* 貼出任務 */
router.post('/post', postController.post);

/* 雙方確認任務 */
router.post('/accept', acceptController.accept);

module.exports = router;
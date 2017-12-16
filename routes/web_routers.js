var express = require('express');
var router = express.Router();

var signController = require('../controllers/register');
var signinController = require('../controllers/signin');
var postController = require('../controllers/post_task');
var requestController = require('../controllers/request_task');
var taskController = require('../controllers/task');


/* 首頁 */
router.get('/', function (req, res) {
    res.render('index');
});

/* 提交登入訊息 */
router.post('/', signinController.signin);

/* 登出 */
router.get('/signout', signinController.signout);

/* 顯示註冊頁面 */
router.get('/register', signController.showRegister);

/* 提交註冊訊息 */
router.post('/register', signController.register);

/* 顯示task頁面 */
router.get('/all-task', taskController.showTask);

/* 新增task頁面 */
router.get('/new-task', taskController.addTask);

/* 提交task訊息 */
router.post('/new-task', taskController.task);

/* 貼出任務 */
router.post('/post', postController.post);

/* 雙方確認任務 */
router.post('/request', requestController.request);



module.exports = router;
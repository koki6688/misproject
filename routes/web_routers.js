var express = require('express');
var router = express.Router();

var memberController = require('../controllers/member');
var SignInController = require('../controllers/signin');
var taskController = require('../controllers/task');
var chatController = require('../controllers/server');


/* 顯示登入頁面 */
router.get('/', function (req, res) {
    res.render('index');
});

/* 顯示首頁 */
router.get('/home', function (req, res) {
    res.render('home');
});

/* 提交登入內容 */
router.post('/', SignInController.signin);

/* 登出 */
router.get('/signout', SignInController.signout);

/* 顯示註冊頁面 */
router.get('/register', memberController.showRegister);

/* 提交註冊內容 */
router.post('/register', memberController.register);

/* 顯示deposit頁面 */
router.get('/deposit', memberController.showDeposit);

/*  */
router.post('/deposit', memberController.deposit);

/* 顯示task頁面 */
router.get('/all-task', taskController.showTask);

/* 顯示user新增task頁面 */
router.get('/new-task', taskController.showAddTask);

/* 提交task內容 */
router.post('/new-task', taskController.task);

/* 刪除任務 */
router.get('/delete/:tid', taskController.delete);

/* tasker接取任務 */
router.post('/request', taskController.request);

/* user同意tasker接取任務 */

router.get('/all-task/:tid',taskController.detail);

/* 顯示個人資料頁面 */
router.get('/member/:mid',memberController.showMember);

/* 顯示個人資料細節頁面 */
router.get('/edit/:mid',memberController.showEdit);

/* 提交編輯之個人資料 */
router.post('/edit/:mid',memberController.editMember);

/* user同意tasker接取任務 */
router.post('/accept', taskController.accept);

/* user不同意tasker接取任務 */
router.post('/decline', taskController.decline);

/* 顯示history頁面 */
router.get('/history',taskController.history);

/* 雙方確認任務結束並評分 */
router.post('/check_and_rate', taskController.check_and_rate);

/* 用戶提交filter */
router.post('/all-task/filter', taskController.filter);

/* 用戶上傳圖片 */
router.post('/upload/:mid', memberController.upload);

router.get('/chat/:tid', chatController.chat);

router.post('/chat/:tid', chatController.chat);




module.exports = router;
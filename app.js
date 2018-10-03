const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const io = require('socket.io');
const eventproxy = require('eventproxy');
const ep = new eventproxy();

//導入 session 外部插件
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const TaskModel = require('./models/task');
const MemberModel = require('./models/member');
const moment = require('moment');
const now = moment().format();

const $ = require('jquery');


//導入busboy以處裡上傳檔案
const busboy = require('connect-busboy');

const webRouter = require('./routes/web_routers');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//建立session

const redisHost = 'redis-17993.c1.ap-southeast-1-1.ec2.cloud.redislabs.com';
const redisPort = 17993;

const sessionMiddleware = session({
    secret: 'asasasas',
    store: new RedisStore({

        port: redisPort,
        host: redisHost,
        name: "i-Sharing",
        password: "ezOIjDRc4lsSrS0JkAfjzNxwkCZiQMiH"
        //port: 6379,
        //host: '127.0.0.1'
    }),
    resave: true,
    saveUninitialized: true
});
app.use(sessionMiddleware);

//檢查並處裡過期任務

app.use(function (req, res, next) {
    TaskModel.findMin({status: 'available'}, {due_date: 1}, function (err, result) {
        if (result) {

            if (moment(result.due_date).isBefore(now)) {
                const update = {$inc: {asset: result.reward}};

                MemberModel.updateMember({_id: result.pmID}, update, function (err, member) {

                    if (member) {

                        TaskModel.removeTask({_id: result._id}, function (err, success) {
                            if (success) {
                                ep.emit('success', '刪除任務成功！');
                            } else {
                                ep.emit('info_error', 'error');
                            }
                        });
                    }
                });
            }
        }
    });
    next();
});

app.use(function (req, res, next) {
    app.locals.current_member = req.session.member;
    app.locals.current_requests = req.session.requests;
    next();
});
app.use(flash());

app.use(function (req, res, next) {
    app.locals.user = req.session.user;
    const suc = req.flash('success');
    res.locals.r_success = suc.length ? suc : null;

    const err = req.flash('error');
    res.locals.r_error = err.length ? err : null;

    const s_err = req.flash('s_error');
    res.locals.s_error = s_err.length ? s_err : null;


    next();
});


app.use('/', webRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

exports.express = app;
exports.sessionMiddleware = sessionMiddleware;
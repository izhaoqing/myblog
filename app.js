
var express = require('express');

//加载模版处理模块
var swig = require('swig');
//加载数据库模块
var mongoose = require('mongoose');
//bodu-parser模块，用来处理post提交过来的数据
var bodyParser = require('body-parser');
//加载cookies模块
var Cookies = require('cookies');

//创建app模块--nodeJs  Http.createServer()
var app = express();

//import css/js
app.use('/public', express.static( __dirname + '/public'));

app.engine('html', swig.renderFile);  
app.set('views', './views');  //views, path
app.set('view engine', 'html'); //

swig.setDefaults({cache:false});

//设置bodyParser, 会在request属性身上加一个body的属性，其值为post请求过来的数据
app.use( bodyParser.urlencoded({extended:true}));
//设置cookies
app.use(function (req, res, next) {
	req.cookies = new Cookies(req, res);
	//解析用户的cookies信息
	req.userInfo = {};
	if (req.cookies.get('userInfo')) {
		try {
			req.userInfo = JSON.parse(req.cookies.get('userInfo'));
		} catch (e) {}
	}
	next();
});

//moduls; api, admin, main
app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

//数据库连接
mongoose.connect('mongodb://localhost:27017/blog', function (err) {
	if (err) {
		console.log('connection failed');
	} else {
		console.log('connection succed');
		app.listen('8080');
	}
});

// app.listen('8080');

//import html
// app.get('/', function (req, res, next) {
// 	// res.send('<h2>hello</h2');
// 	res.render('index'); //options:path,
// });


//import css
// app.get('/style.css', function (req, res, next) {
// 	// res.render('style.css');
// 	res.setHeader('content-type','text/css');
// 	res.send('body {background:red;}');
// });



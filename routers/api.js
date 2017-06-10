
var express = require('express');
var router = express.Router();
var User = require('../models/user'); //返回一个构造函数


//统一返回格式
var responseData;
router.use(function (req, res, next) {
	responseData = {
		code : 0,
		message : ''
	};
	next();
});

//登录
router.post('/user/login', function (req, res, next) {
	
	var username = req.body.username;
	var password = req.body.password;

	//用户名不存在
	User.findOne({
		username : username,
		password : password
	}).then(function(userInfo){
		if (!userInfo) {
			responseData.code = 1;
			responseData.message = '用户名或密码错误';
			res.json(responseData);
			return;
		}
		responseData.message = '登录成功';
		responseData.userInfo = {
			_id : userInfo._id,
			username : userInfo.username
		};
		//发送cookies信息
		req.cookies.set('userInfo', JSON.stringify({
			_id : userInfo._id,
			username : userInfo.username
		}));
		res.json(responseData);
		return;
	});	
});

//注册
router.post('/user/register', function (req, res, next) {

	var username = req.body.username;
	var password = req.body.password;

	//用户名已经被注册
	User.findOne({
		username : username
	}).then(function (userInfo) {
		if (userInfo) {
			responseData.code = 2;
			responseData.message = '用户名已经被注册';
			res.json(responseData);
			return;
		} 
		//未注册保存到数据库
		var user = new User({
			username : username,
			password : password
		});
		return user.save();
	}).then(function (newuserInfo) {
		// console.log(newuserInfo);
		responseData.code = 3;
		responseData.message = '注册成功';
		res.json(responseData);
		return;
	});
});

//退出
router.get('/user/logout', function (req, res) {
	req.cookies.set('userInfo', '');
	res.json(responseData);
});


module.exports = router;







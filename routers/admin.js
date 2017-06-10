var express = require('express');
var router = express.Router();
var Users = require('../models/user');
var Category = require('../models/category');
var Content = require('../models/content');

/*
若未登录，则跳转到管理首页
*/
function isAdmin (req, res) {
	if (req.userInfo.username !== 'zq') {
		// res.render('admin/index');
		res.redirect('/admin');//跳转页面
		return false;
	}
};


var responseData;
router.use(function(req, res, next) {
	responseData = {
		code : '0',
		message : ''
	};
	next();
});

router.get('/', function (req, res, next) {
	var page = Number(req.query.page || 1);
	var limit = 20;
	var skip;
	var pages = 0;

	Content.count().then(function (count) {
		pages = Math.ceil(count/limit);
		page = Math.max(page, 1);
		page = Math.min(page, pages);
		skip = (page - 1) * limit;

		if (count != 0) {
			Content.find().limit(limit).skip(skip).populate('category')
			.then(function(contents) {
				res.render('admin/index', {
					username : req.userInfo.username,
					contents : contents,
					page : page
				});
			});
		} else {
			res.render('admin/index', {
				username : req.userInfo.username,
				page : page
			});
		}	
	});
});

router.post('/login', function (req, res, next) {
	
	var username = req.body.username;
	var password = req.body.password;

	if (username == 'zq' && password == '123') {
		responseData.message = '登录成功';
		req.cookies.set('userInfo', JSON.stringify({'username':username}));

	} else {
		responseData.code = '1';
		responseData.message = '登录失败';
	}
	res.json(responseData);
	return;
});

router.post('/logout', function (req, res, next) {
	req.cookies.set('userInfo', '');
	res.json(responseData);
	return;
});

//用户管理
router.get('/users', function (req, res) {
	isAdmin(req, res);

		//获取所有账号信息
		/*
		limit(number) 限制显示的条数
		skip(number) 忽略条数
		count() 数据总条数
		eg: User.count().then(function () { alert(count); })
		*/
		var page = Number(req.query.page || 1);
		var limit = 20;
		var skip;
		var pages = 0;

		Users.count().then(function (count) {
			pages = Math.ceil(count/limit);
			page = Math.max(page, 1);
			page = Math.min(page, pages);
			skip = (page - 1) * limit;

			Users.find().limit(limit).skip(skip).then(function (users) {
				res.render('admin/users', {
					username : req.userInfo.username,
					users : users,
					page : page
				});
			});	
		});

});

//分类管理
router.get('/category', function (req, res) {
	isAdmin(req, res);

	Category.find().then(function (categories) {
		res.render('admin/category', {
			username : req.userInfo.username,
			categories : categories
		})
	});
});

//添加分类
var categoryData;
router.use(function (req, res, next) {
	categoryData = {
		code : 0,
		message : '添加成功'
	};
	next();
});
router.post('/category', function(req, res) {
	var name = req.body.name;
	// console.log(name);
	if (name == '') {
		categoryData.code = 1;
		categoryData.message = '输入不能为空';
		res.json(categoryData);
		return;
	} 

	Category.findOne({
		name : name
	}).then(function (cateInfo) {
		if (cateInfo) {
			categoryData.code = 2;
			categoryData.message = '分类已存在';
			res.json(categoryData);
			return;
		}
		var category = new Category({
			name : name
		});
		res.json(categoryData);
		return category.save();
		
	});	
});

//修改分类
router.get('/category/edit', function (req, res) {
	isAdmin(req, res);
	var id = req.query.id || '';
	Category.findOne({
		_id : id
	}).then(function (category) {
		if (!category) {
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '分类信息不存在！',
				url : '/admin/category'
			});
			return;
		} else {
			res.render('admin/category_edit', {
				username : req.userInfo.username,
				category : category
			});
		}
	});
});
router.post('/category/edit', function (req, res) {
	isAdmin(req, res);
	var id = req.query.id;
	var name = req.body.name || '';
	Category.findOne({
		_id : id
	}).then(function (category) {
		if(!category) {
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '分类未找到！',
				url : '/admin/category'
			});
			return;
		} else {
			Category.findOne({
				name : name
			}).then(function (category) {
				if (category) {
					res.render('admin/error', {
						username : req.userInfo.username,
						message : '分类已存在！',
						url : '/admin/category'
					});
					return Promise.reject();
				} else {
					return Category.update({
						_id : id
					}, {
						name : name
					});
				}
			}).then(function () {
				res.render('admin/error', {
					username : req.userInfo.username,
					message : '分类修改成功！',
					url : '/admin/category'
				});
			});
		}
	});
});

//删除分类
router.get('/category/delete', function (req, res) {
	isAdmin(req, res);
	var id = req.query.id;
	Category.remove({
		_id : id
	}).then(function () {
		res.render('admin/error', {
			username : req.userInfo.username,
			message : '分类删除成功！',
			url : '/admin/category'
		});
	});
});


//发布博客
router.get('/content', function (req, res) {
	isAdmin(req, res);
	Category.find().then(function (categories) {
		res.render('admin/content', {
			username : req.userInfo.username,
			categories : categories
		});
	});
});
//提交发布
router.post('/content', function (req, res) {
	var category = req.body.category;
	var title = req.body.title;
	var discription = req.body.discription;
	var content = req.body.content;
	if (req.userInfo.username == 'zq') {

		if (title == '' || discription == '' || content == '') {
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '输入不能为空',
				url : '/admin/content'
			});
			return false;
		}

		Content.findOne({title : title}, function (err, content) {
			if (content) {
				res.render('admin/error', {
					username : req.userInfo.username,
					message : '标题已存在',
					url : '/admin/content'
				});
				return;
			}
			new Content({
				category : req.body.category,
				title : req.body.title,
				discription : req.body.discription,
				content : req.body.content,
				time : new Date()
			}).save();
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '发布成功',
				url : '/admin'
			});
		});
	} else {
		res.redirect('/admin');
	}
});
//博文修改
router.get('/content/edit', function (req, res) {
	isAdmin(req, res);

	var id = req.query.id || '';
	Content.findOne({_id : id}, function (err, content) {
		if (!content) {
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '内容不存在',
				url : '/admin'
			});
			return;
		}
		Category.find(function (err, category) {
			// console.log(content);
				res.render('admin/content_edit', {
				username : req.userInfo.username,
				content : content,
				category : category
			});
		});
	});
});
//博文修改保存
router.post('/content/edit', function (req, res) {
	isAdmin(req, res);

	var id = req.query.id;
	Content.update({_id:id}, {
		category : req.body.category,
		title : req.body.title,
		discription : req.body.discription,
		content : req.body.content
	}, function (err, result) {
		if (!err) {
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '修改成功',
				url : '/admin/content/edit?id='+id
			});
		}
	});
});
//删除博文
router.get('/content/delete', function (req, res) {
	isAdmin(req, res);
	var id = req.query.id;
	Content.remove({_id:id}, function (err) {
		if (!err) {
			res.render('admin/error', {
				username : req.userInfo.username,
				message : '删除成功',
				url : '/admin'
			});
		}
	});
});

module.exports = router;










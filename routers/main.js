var express = require('express');
var router = express.Router();
var fs = require('fs');
var Category = require('../models/category');
var Content = require('../models/content');
var HyperDown = require('hyperdown');

var userInfo, categories;

router.get('/', function (req, res, next) {
	
	var data = {};
	data.type = req.query.type || '';
	data.search = req.query.search || '';
	data.page = Number(req.query.page || 1);
	var limit = 10;
	var skip;
	data.pages = 0;
	var pagination = [];

	var where = {};
	if (data.type) {
		where.category = data.type;
	}

	//文章推荐
	Content.find({}, function (err, contents) {
		data.recom = contents;
	}).limit(5).sort({view:-1});

	Content.where(where).count().then(function (count) {
		data.pages = Math.ceil(count/limit);
		data.page = Math.max(data.page, 1);
		data.page = Math.min(data.page, data.pages);
		skip = (data.page - 1) * limit;

		if (data.search) {
			Content.find({content:new RegExp(data.search)},function (err, contents) {
				if (err) {
					res.render('main/404', {
						userInfo : req.userInfo,
						categories : data.categories
					});
					return false;
				} else {
					data.pages = Math.ceil(contents.length/limit);
				}
			});
		}

		//分页标签
		if(data.page<3) {
			for (var i = 1; i < 6; i++) {
				if(i<=data.pages) {
					pagination.push(i);
				}
			}
		}else if(data.page > data.pages-2){
			for(var j = 4; j >= 0; j--){
				if((data.pages-j) > 0){
					pagination.push(data.pages-j);
				}
			}
		} else {
			pagination = [data.page-2, data.page-1, data.page, data.page+1, data.page+2];
		}
	});

	Category.find().then(function (categories) {
		data.categories = categories;

		if (data.search) {
			Content.find({content:new RegExp(data.search)},function (err, contents) {
				if (err) {
					res.render('main/404', {
						userInfo : req.userInfo,
						categories : data.categories
					});
					return false;
				} 
				if (contents.length == 0) {
					searchL = 0;
				}
				res.render('main/index.html', {
					userInfo : req.userInfo,
					contents : contents || '',
					page : data.page,
					pages : data.pages,
					categories : data.categories,
					type : data.type,
					paginations : pagination,
					recoms : data.recom,
					searchLength : searchL
				});
			}).limit(limit).skip(skip).populate('category').sort({time:-1});

		} else {

			Content.where(where).find({}, function (err, contents) {
				res.render('main/index.html', {
					userInfo : req.userInfo,
					contents : contents || '',
					page : data.page,
					pages : data.pages,
					categories : data.categories,
					type : data.type,
					paginations : pagination,
					recoms : data.recom,
					searchLength : 1
				});

			}).limit(limit).skip(skip).populate('category').sort({time:-1});
		}
	});

});

//demo页面
router.get('/demo', function (req, res) {
	var pageName = req.query.name;
	var page = 'demopage/' + pageName;
	res.render( page, {
		userInfo : req.userInfo,
	});
});

router.get('/content', function (req, res) {
	var id = req.query.id;
	var type = req.query.type;
	var data = {};
	var prev = {};
	var next = {};

	//下一页
	Content.find({_id:{'$lt':id}}, function (err, content) {
		if (err) {
			res.render('main/404', {
				userInfo : req.userInfo,
				categories : data.categories
			});
			return false;
		}
		if(content.length == 0) {
			return false;
		}
		next.id = content[0]._id;
		next.category = content[0].category;
	}).sort({_id:-1}).limit(1);

	//上一页
	Content.find({_id:{'$gt':id}}, function (err, content) {
		if (err) {
			res.render('main/404', {
				userInfo : req.userInfo,
				categories : data.categories
			});
			return false;
		}
		if(content.length == 0) {
			return false;
		}
		prev.id = content[0]._id;
		prev.category = content[0].category;
	}).sort({_id:1}).limit(1);

	Category.find().then(function (categories) {
		data.categories = categories;
	
		Content.findOne({_id:id}, function (err, content) {
			if (err) {
				res.render('main/404', {
					userInfo : req.userInfo,
					categories : data.categories
				});
				return false;
			}

			Category.findOne({_id:content.category}, function (err, category) {
				content.view ++;
				content.save();

				var parse = new HyperDown;
				content.text = parse.makeHtml(content.content);

				content.category.name = category.name;
				res.render('main/content.html', {
					userInfo : req.userInfo,
					categories : data.categories,
					content : content,
					type : type,
					next : next,
					prev : prev
				});
			});
			
		});
	});
});
//评论提交
router.post('/content/comment', function (req, res) {
	var id = req.query.id || '';
	var ret = {
		message : '评论失败',
		code : 0
	};
	var data = {
		username : req.body.username,
		emeil : req.body.emeil,
		content : req.body.comment,
		postTime : new Date(),
		like : 0
	}; 
	Content.findOne({_id:id}, function (err, content) {
		if (err) {
			return false;
		}
		ret.message = '评论成功';
		ret.code = '1';
		content.comment.push(data);
		content.save();
		res.json(ret);
	});
});
//获取评论
router.get('/content/comment', function (req, res) {
	var id = req.query.id || '';
	Content.findOne({_id:id}, function (err, content) {
		if (err) {
			return false;
		}
		res.json(content.comment);
	});
});
//点赞
router.post('/content/like', function (req, res) {
	var id = req.query.id || '';
	var postTime = req.body.postTime;
	var ret = {
		'code':1,
		'message':'点赞失败'
	};
	Content.findOne({_id:id}, function (err, content) {
		if(err) {
			res.json(ret);
			return false;
		}
		var newComment = content.comment;
		for (var i = 0; i < newComment.length; i++) {
			//将时间对象转成毫秒字符串
			if(newComment[i].postTime.valueOf() == (new Date(postTime)).valueOf()){
				newComment[i].like = Number(newComment[i].like)+1 || 1;
				ret.code = 0;

				Content.update({_id:id}, {
					comment : newComment
				}, function (err, newcontent) {
					if(err) {
						return false;
					}
				});
				return false;
			}
		}
		res.json(ret);
	});
});

module.exports = router;














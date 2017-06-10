var mongoose = require('mongoose');

//添加博客表结构
module.exports = new mongoose.Schema({

	//关键字段
	category : {
		//类型
		type : mongoose.Schema.Types.ObjectId,
		//引用
		ref : 'Category' //引用category.js中的Category
	},

	//时间
	time : {
		//类型
		type : Date,
		default : new Date()
	},

	//阅读量
	view : {
		type : Number,
		default : 0
	},

	title : String,  //字符串类型

	discription : {
		type : String,
		default : ''
	},

	content : {
		type : String,
		default : ''
	},

	comment : {
		type : Array,
		default : []
	}
});





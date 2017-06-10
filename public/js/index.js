
$(function () {

	/*表单*/
	(function () {
		var loginForm = $('#login');
		
		$('#search').on('focus', '._text', function() {
			$(this).css('borderColor', '#ff5e1e')
			.next().css('color', '#ff5e1e');
		}).on('blur', '._text', function () {
			if (!$.trim($(this).val())) {
				$(this).css('borderColor', '#ddd')
				.next().css('color', '#ddd');
			}
		});

		loginForm.on('focus', 'input', function () {
			$(this).css('borderColor', '#ff5e1e');
		}).on('blur', 'input', function () {
			$(this).css('borderColor', '#ddd');
		});

		//登录/注册
		var btn_login = loginForm.find('._btn_login');
		var btn_reg = loginForm.find('._btn_reg');
		var a_login = loginForm.find('._login');
		var a_reg = loginForm.find('._reg');
		var repassword = loginForm.find('.repassword');
		var password = loginForm.find('input[type="password"]');
		a_reg.on('click', function () {
			$(this).hide();
			a_login.show();
			btn_login.hide();
			btn_reg.show();
			repassword.show();
		});

		a_login.click(function () {
			$(this).hide();
			a_reg.show();
			btn_login.show();
			btn_reg.hide();
			repassword.hide();
		});

		//登录/注册提交
		$('#loginBtn, #regBtn').click(function (event) {
			event.preventDefault();
			
			//登录提交地址
			var url = loginForm.attr('action');

			//表单验证
			var off = function () {
				var pass = true;
				loginForm.find('input').filter(':visible').each(function () {
					if (!$(this).val()) {
						$(this).css('borderColor', 'red');
						pass = false;
						return pass;
					}
				});

				repassword.is(':visible') && (function () {
					//注册提交地址
					url = '/api/user/register';
					if (repassword.val() !== password.val()) {
						repassword.css('borderColor', 'red');
						pass = false;
						return pass;
					}
				})();
				return pass;
			};

			off() && submit();
			function submit () {
				var data = loginForm.serializeArray();
				$.ajax({
					url : url,
					type : 'post',
					data : data,
					success : function (result) {
						loginForm[0].reset();
						alert(result.message);

						//注册成功
						if (result.code == '3') {
							$('#login')[0].reset();
							$('#login ._login').trigger('click');
						}

						//登录成功
						if (result.code == '0') {
							$('#login').get()[0].reset();
							window.location.reload();
						}
					}
				});
			};
		});

		//退出登陆
		$('#logout').click(function() {
			$.ajax({
				url : '/api/user/logout',
				success : function (result) {
					if (!result.code) {
						window.location.reload();
					}
				}
			});
		});
	})();

	//微信二维码
	$('#weChat').mouseover(function () {
		$('#weChatImg').fadeIn(200);
	}).mouseout(function() {
		$('#weChatImg').fadeOut(200);
	});

});









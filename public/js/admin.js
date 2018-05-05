
$(function () {
	//登录表单
	var $form = $('#formLogin');
	$('#submitBtn').click(function (event) {
		event.preventDefault();
		var url = $form.attr('action');
		$.ajax({
			url : url,
			data : $form.serializeArray(),
			type : 'post',
			success : function (res) {
				alert(res.message);
				if (res.code == '0') {
					window.location.reload();
				}
			}
		});
		return false;
	});

	//退出登录
	$('#logoutBtn').click(function () {
		$.ajax({
			url : '/admin/logout',
			type : 'post',
			success : function (res) {
				if(res.code == '0') {
					window.location.reload();
				}
			}
		});
	});


});
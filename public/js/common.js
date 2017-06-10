//底部居地底
(function () {
	resize();
	function resize () {
		var $wHeight = $(window).height();
		var $hHeight = $('html').height();
		if ($hHeight < $wHeight) {
			$('.footer').css({'position':'fixed', 'bottom':'0', 'left':'0'});
		} else {
			$('.footer').css('position', 'static');
		}
		$('body').css('min-height', $wHeight);
	};
	$(window).resize(function () {
		resize();
	});
})();

//移动端菜单显示
(function () {
	$('#navBtn').click(function () {
		$('#navMenu').toggleClass('show');
		$('#search').hide();
		if ($('#navMenu').is(':hidden')) {
			$('.menu_mask').hide();
		} else {
			$('.menu_mask').show();
		}
	});
	$('.menu_mask').click(function () {
		$('.menu_mask').hide();
		$('#navMenu').removeClass('show');
		$('#search').hide();
	});
	$('#navSearch').click(function () {
		$('#search').toggle();
		$('#navMenu').removeClass('show');
		if ($('#search').is(':hidden')) {
			$('.menu_mask').hide();
		} else {
			$('.menu_mask').show();
		}
	});
})();
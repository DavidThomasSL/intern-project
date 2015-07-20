(function($) {

	$(document).ready(function(){
		$(".typer").typed({
		    strings: [" lonage" ],
		    typeSpeed: 40,
		    backDelay: 1000,
		    showCursor: false
		});
		$('.header a i').delay(7500).queue(function(next) {
			$(this).addClass('animating');
			next();
		})
	});

})(jQuery);

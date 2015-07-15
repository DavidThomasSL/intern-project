(function($) {

	$(document).on('click', '.navButton', function(){
		$(this).toggleClass('open');
		$('.socialInfo').toggleClass('openSocial');
	});

	$(document).ready(function(){
		$('a[href*=#]:not([href=#])').click(function() {
		  if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		    var target = $(this.hash);
		    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		    if (target.length) {
		      $('html,body').animate({
		        scrollTop: target.offset().top
		      }, 650);
		      return false;
		    }
		  }
		});
	});

	$(document).ready(function(){
		$(document).alton({
		    firstClass : 'header', // Set the first container class
		    bodyContainer: 'pageWrapper', // Set the body container
		    scrollMode: 'headerScroll', // Set the scroll mode
		});
	})

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

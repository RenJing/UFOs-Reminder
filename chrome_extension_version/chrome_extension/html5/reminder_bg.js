	$(document).ready(function() {
		drawBackground();
		getOrdersFromServer();
		//setBoxCenter();
		bindGoToUFOsEvent();
	});
	
	function drawBackground() {
		var bg = document.getElementById('layer1');
		var context = bg.getContext('2d');
		if (context) {
			for (var i = 0; i < context.canvas.width; i+=4) {
				context.fillStyle = '#D4E3B8';
				context.fillRect(i, 0, 1, context.canvas.height);
				context.fillStyle = '#D2EEAE';
				context.fillRect(i+1, 0, 3, context.canvas.height);
			}
		}
	}
	
	function setBoxCenter() {
		var box = $('.box');
		box.css('left', (window.innerWidth - box.width())/2 + 'px');
	}
	
	function bindGoToUFOsEvent() {
		var linkButton = $('#link_to_ufos');
		linkButton.attr('href', DefaultConfig.ufosUrl);
	}
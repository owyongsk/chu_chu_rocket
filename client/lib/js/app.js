$(document).ready(function() {
	var gamemap = {};
	
	gamemap.selector = '#map';
	gamemap.gen = function(col, row){
		var $game = $(gamemap.selector);
		// For each row,
		//   insert col divs 
		var html = '';
		for (var r = 0; r < row ; r++){
			html += '<div class="row">';
			for (var c = 0 ; c < col ; c++){
				html += '<div class="cell"></div>';
			}
			html += '</div>';
		}
		$game.html(html);
	};
	gamemap.gen(7, 4);
});
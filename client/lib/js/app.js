$(document).ready(function() {
	var gamemap = {};
	
  var id = 1;

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

    var cursorPos = {x:0, y:0};
    $game.mousemove(function(e){
      var parentOffset = $(this).offset(); 
      //or $(this).offset(); if you really just want the current element's offset
      var relX = e.pageX - parentOffset.left;
      var relY = e.pageY - parentOffset.top;

      cursorPos.x = relX;
      cursorPos.y = relY;
    }); 

    $('body').keydown(function(e){
      switch (event.which){
        case 65:
          console.log('a', cursorPos);
          var direction = 'up';
          Meteor.call('addArrow', id, cursorPos, direction, function(err, result){
            console.log(err);
            console.log(result);
          });
          break;
      }
    });
	};
	gamemap.gen(7, 4);

});

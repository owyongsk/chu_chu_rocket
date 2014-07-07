var KEY_W = 87;
var KEY_A = 65;
var KEY_S = 83;
var KEY_D = 68;

$(document).ready(function() {
	var gamemap = {};
	
  var id = purl().param('id') || 1;

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
      console.log('cursorPos = ', cursorPos);
    }); 

    $('body').keydown(function(e){
      var direction = '';
      switch (event.which){
        case KEY_W: direction = 'up'; break;
        case KEY_A: direction = 'left'; break;
        case KEY_S: direction = 'down'; break;
        case KEY_D: direction = 'right'; break;
        default: direction = '';
      }
      if (direction != ''){
        Meteor.call('addArrow', id, cursorPos, direction, function(err, result){
          console.log(err);
          console.log(result);
        });
      }
    });
	};
	gamemap.gen(15, 9);

  $('#btnSetCat').on("click", function(event) {
    var numCats = $("#num_cat").val();
    Meteor.call('resetGame', numCats);
  });
});

Mice = new Meteor.Collection("mice");
Players = new Meteor.Collection("players");
SpawnPoints = new Meteor.Collection('spawn_points');
Arrows = new Meteor.Collection('arrows');
Destinations = new Meteor.Collection('destinations');
Cats = new Meteor.Collection('cats');

// 15 x 8
var MAX_PLAYERS = 4;
var GRID_LENGTH = 50;
var MAX_COL = 15;
var MAX_ROW = 9;
var MAX_WIDTH = GRID_LENGTH * MAX_COL;
var MAX_HEIGHT = GRID_LENGTH * MAX_ROW;
var HALF_GRID = GRID_LENGTH / 2;

var players = { };
var arrows = {
};

var CAT_PUNISH_SCORE = 50;
var MICE_SCORE = 1;

_.each(_.range(1, MAX_PLAYERS+1), function(i){
  arrows['' + i] = [];
});

var grid2pixel = function(col, row){
  return {top: row * GRID_LENGTH + HALF_GRID, left: col * GRID_LENGTH + HALF_GRID};
}

var RIGHT = 'right';
var UP = 'up';
var LEFT = 'left';
var DOWN = 'down';

var sps_easy = [
    // single one
    _.extend({direction: UP}   , grid2pixel(MAX_COL-2,2))
];

var sps_real_hard = [
    // Very difficult one
    _.extend({direction: UP}   , grid2pixel(1,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(2,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(3,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(4,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(5,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(6,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(7,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(8,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(9,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(10,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(11,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(12,MAX_ROW-1))
  , _.extend({direction: UP}   , grid2pixel(13,MAX_ROW-1))

  , _.extend({direction: RIGHT}   , grid2pixel(0,1))
  , _.extend({direction: RIGHT}   , grid2pixel(0,2))
  , _.extend({direction: RIGHT}   , grid2pixel(0,3))
  , _.extend({direction: RIGHT}   , grid2pixel(0,4))
  , _.extend({direction: RIGHT}   , grid2pixel(0,5))
  , _.extend({direction: RIGHT}   , grid2pixel(0,6))
  , _.extend({direction: RIGHT}   , grid2pixel(0,7))

  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,1))
  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,2))
  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,3))
  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,4))
  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,5))
  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,6))
  , _.extend({direction: LEFT}   , grid2pixel(MAX_COL-1,7))

  , _.extend({direction: DOWN}   , grid2pixel(1,0))
  , _.extend({direction: DOWN}   , grid2pixel(2,0))
  , _.extend({direction: DOWN}   , grid2pixel(3,0))
  , _.extend({direction: DOWN}   , grid2pixel(4,0))
  , _.extend({direction: DOWN}   , grid2pixel(5,0))
  , _.extend({direction: DOWN}   , grid2pixel(6,0))
  , _.extend({direction: DOWN}   , grid2pixel(7,0))
  , _.extend({direction: DOWN}   , grid2pixel(8,0))
  , _.extend({direction: DOWN}   , grid2pixel(9,0))
  , _.extend({direction: DOWN}   , grid2pixel(10,0))
  , _.extend({direction: DOWN}   , grid2pixel(11,0))
  , _.extend({direction: DOWN}   , grid2pixel(12,0))
  , _.extend({direction: DOWN}   , grid2pixel(13,0))

];

var sps_normal = [
    _.extend({direction: UP}   , grid2pixel(6,3))
  , _.extend({direction: UP}   , grid2pixel(5,2))
  , _.extend({direction: UP}   , grid2pixel(4,1))

  , _.extend({direction: RIGHT}, grid2pixel(8,3))
  , _.extend({direction: RIGHT}, grid2pixel(9,2))
  , _.extend({direction: RIGHT}, grid2pixel(10,1))

  , _.extend({direction: DOWN} , grid2pixel(8,5))
  , _.extend({direction: DOWN} , grid2pixel(9,6))
  , _.extend({direction: DOWN} , grid2pixel(10,7))

  , _.extend({direction: LEFT} , grid2pixel(4,7))
  , _.extend({direction: LEFT} , grid2pixel(5,6))
  , _.extend({direction: LEFT} , grid2pixel(6,5))
];
var sps = sps_normal;

var destinations = [
    _.extend(grid2pixel(0,0), {pid: 1})
  , _.extend(grid2pixel(MAX_COL-1,0), {pid: 2})
  , _.extend(grid2pixel(0,MAX_ROW-1), {pid: 3})
  , _.extend(grid2pixel(MAX_COL-1,MAX_ROW-1), {pid: 4})
];

// return the change for move & direction
function move(direction){
  switch(direction) {
    case "up":
      return {$inc: {top: -GRID_LENGTH}}
    case "down":
      return {$inc: {top: GRID_LENGTH}}
    case "left":
      return {$inc: {left: -GRID_LENGTH}}
    case "right":
      return {$inc: {left: GRID_LENGTH}}
  }
}

function directionAfterWall(mouse){
  // Corner cases
  var topLeftCon = grid2pixel(0,0);
  var topRightCon = grid2pixel(MAX_COL-1, 0);
  var bottomLeftCon = grid2pixel(0, MAX_ROW-1);
  var bottomRightCon = grid2pixel(MAX_COL-1, MAX_ROW-1);

  if        (mouse.top <= topLeftCon.top  && mouse.left <= topLeftCon.left  && mouse.direction == 'left') {
    return 'right';
  } else if (mouse.top <= topRightCon.top && mouse.left >= topRightCon.left && mouse.direction == 'up') {
    return 'down';
  } else if (mouse.top >= bottomRightCon.top && mouse.left >= bottomRightCon.left && mouse.direction == 'right') {
    return 'left';
  } else if (mouse.top >= bottomLeftCon.top && mouse.left <= bottomLeftCon.left && mouse.direction == 'down') {
    return 'up';

  // Wall cases
  } else if (mouse.top  <= topLeftCon.top  && mouse.direction == 'up'){
    return 'right';
  } else if (mouse.top  >= bottomLeftCon.top && mouse.direction == 'down'){
    return 'left';
  } else if (mouse.left <= topLeftCon.left  && mouse.direction == 'left'){
    return 'up';
  } else if (mouse.left >= topRightCon.left && mouse.direction == 'right'){
    return 'down';
  } else {
    return mouse.direction;
  }
}

function spawnCat(){
  // debug
  //var x = 5 * GRID_LENGTH + 25;//_.random(0, MAX_GRID_X) * GRID_LENGTH + 25;
  //var y = 0 * GRID_LENGTH + 25;//_.random(0, MAX_GRID_Y) * GRID_LENGTH + 25;
  var x = _.random(0, MAX_COL-1) * GRID_LENGTH + 25;
  var y = _.random(0, MAX_ROW-1) * GRID_LENGTH + 25;
  var dir = 'left';
  switch(_.random(0, 3)){
    case 0: dir = 'up'; break;
    case 1: dir = 'down'; break;
    case 2: dir = 'left'; break;
    case 3: dir = 'right'; break;
  }
  Cats.insert({left:x, top:y, direction: dir});
}

// any A collides with any B, the cb will be called.
function collideWith(objAs, objBs, cb){
  cb = cb || function(){};
  _.each(objAs, function(a,i){
    _.each(objBs, function(b,j){
      if (a.top == b.top && a.left == b.left){
        cb(a, b);
      }
    });
  });
}

// Return which destination the obj is stepping on.
function getOnDestination(obj){
  var dst = _.find(destinations, function(dst){
    return mouse.top == dst.top && mouse.left == dst.left;
  });

  return dst;
}

function scorePoint(mouse, op, cls){
  var dst = _.find(destinations, function(dst){
    return mouse.top == dst.top && mouse.left == dst.left;
  });


  if (dst){
    Players.update(players['' + dst.pid], op);
    cls.remove(mouse._id);
    if (cls == Cats){
      spawnCat();
    }
  }
}

function resetGame(numCats){
  Mice.remove({});    // remove all mice
  Players.remove({}); // remove all players
  SpawnPoints.remove({});
  Arrows.remove({});
  Destinations.remove({});
  Cats.remove({});

//  numCats = num
  var iNumCats = parseInt(numCats, 10);
 // console.log(iNumCats);
  gNumCats = numCats;
  for (var i = 0; i < iNumCats; i++) {
    spawnCat();
  }
//  spawnCat();

  _.each(sps, function(sp) {
    SpawnPoints.insert( sp );
    Mice.insert(sp);
  });

  _.each(destinations, function(dst){
    Destinations.insert( dst );
  });

  _.each(_.range(1, MAX_PLAYERS+1), function(i){
    players['' + i] = Players.insert({
      number: i,
      score: 0
    });

  });
}

if (Meteor.isClient) {
  Template.ccr_cats.cats = function(){
    var ret = Cats.find().fetch();
    _.each(ret, function(cat, i){
      ret[i].top -= 25;
      ret[i].left -= 25;
      ret[i].cat_class = 'glyphicon glyphicon-remove';
    });

    return ret;
  };

  Template.ccr_sps.sps = function(){
    var ret = _.extend([], sps);
    _.each(ret, function(sp){
      sp.top -= 25;
      sp.left -= 25;
      sp.sp_class= 'glyphicon glyphicon-asterisk player-' + sp.player;
    });
    return ret;
  };

  Template.ccr.mice = function() {
    var mice = Mice.find().fetch();
    _.each(mice, function(mouse, i){
      mice[i].top -= 25;
      mice[i].left -= 25;
    });
    return mice;
  }
  Template.ccr_score.players = function() {
    return Players.find({});
  }

  Template.ccr_arrows.arrows = function(){
    var arrowsTemp = Arrows.find().fetch();
    _.each(arrowsTemp, function(arrow, i){
      arrowsTemp[i].top -= 25;
      arrowsTemp[i].left -= 25;
      arrowsTemp[i].arrow_class = 'glyphicon glyphicon-arrow-' + arrowsTemp[i].direction + ' player-' + arrow.pid;
    });
    return arrowsTemp;
  }

  Template.ccr_destinations.destinations = function(){
    var destinations = Destinations.find().fetch();
    _.each(destinations, function(dst, i){
      destinations[i].top -= 25;
      destinations[i].left -= 25;
      //destinations[i].dst_class = 'glyphicon glyphicon-asterisk player-' + dst.pid;
      destinations[i].dst_class = 'glyphicon glyphicon-cloud-upload player-' + dst.pid;
    });
    return destinations;
  }

  // template to render configuration section
  var gNumCats = 2;
  Template.ccr_config.numcats = function() {
    return gNumCats;
  }

  //Template.ccr.events({
  //  'click #game .cell': function () {
  //    console.log('clicked');
  //  }
  //});
}

var canPutArrow = function(pid, pos){
  // center
  var x = Math.floor(pos.x / GRID_LENGTH) * GRID_LENGTH + 25;
  var y = Math.floor(pos.y / GRID_LENGTH) * GRID_LENGTH + 25;

  var conflictedSp = _.find(sps, function(sp, i){
    return sp.top == y && sp.left == x;
  });

  if (conflictedSp){
    return false;
  }

  var conflictedArrow = Arrows.findOne({top:y, left:x});
  if (conflictedArrow){
    return false;
  }
  return true;
}

Meteor.methods({
  addArrow: function(playerId, pos, direction){
    if (canPutArrow(playerId, pos)){
      if (arrows[playerId].length >= 3){
        var firstArrowId = arrows[playerId].shift();
        Arrows.remove({_id: firstArrowId});
      }
      var x = Math.floor(pos.x / GRID_LENGTH) * GRID_LENGTH + 25;
      var y = Math.floor(pos.y / GRID_LENGTH) * GRID_LENGTH + 25;
      var aid = Arrows.insert({top: y, left: x, direction: direction, pid: playerId});
      arrows[playerId].push(aid);
      return aid;
    }
    return '';
  },
  resetGame: function(numCats){
    resetGame(numCats);
  }
});

var directionAfterArrow = function(obj, cb){
  var arrow = Arrows.findOne({top: obj.top, left: obj.left});
  //console.log(arrow);
  if (arrow){
    if (cb) cb(arrow);
    return arrow.direction;
  }

  return obj.direction;
}

if (Meteor.isServer) {
  var spawningRate = 1000;
  var lock = false;
  /******************************\
             Game loop
  \******************************/
  Meteor.setInterval(function() {
    if (lock == false){
      lock = true;
      var toUpdate = [];

      var mice = Mice.find({}).fetch();
      var playersChanges = {
        1: {}
        , 2: {}
        , 3: {}
        , 4: {}
      };

      collideWith(mice, destinations, function(m, d){
        // Remove the mouse (just mark it to be removed)
        m.remove = true;

        // Update the player change
        if (!playersChanges[d.pid].$inc){
          playersChanges[d.pid].$inc = {score: 1};
        } else {
          if (!playersChanges[d.pid].$inc.score){
            playersChanges[d.pid].$inc.score = 1;
          } else {
            playersChanges[d.pid].$inc.score++;
          }
        }
      });

      _.each(mice, function(mouse, i){
        if (!mouse.remove){  // undefined || null || false
          mouse.direction = directionAfterArrow(mouse);
          var new_dir = directionAfterWall(mouse);
          mice[i].change = _.extend({}
              , mice[i].change
              , {$set: {direction: new_dir}}
              , move(new_dir)
          );
        }
      });

      mice = _.groupBy(mice, function(m){
        return m.remove ? 'remove' : 'stay';
      });
      console.log('update mices:', mice);

      // remove the mices
      if (mice.remove){
        var toRemove = _.pluck(mice.remove, '_id');
        console.log('toRemove = ', toRemove);
        Mice.remove({_id: {$in: toRemove}});
      }

      // other mice that should stay in the game will move
      if (mice.stay){
        _.each(mice.stay, function(m, i){
          Mice.update(m._id, m.change);
        });
      }


      // Update the player's score
      console.log('update players:', playersChanges);

      _.each(playersChanges, function(p, n){
        if (_.size(p)){
          var change = p;
          var id = players[n];
          console.log('going to update players[' + n + '](' + id + ')' + JSON.stringify(change));
          Players.update(id, change);
        }
      });


      // Move the mice.
      // Arrow collision was detected before move so that we can find new direction of the coming move.
      // .detection after mouse move.
      //Mice.find({}).forEach(function (mouse) {
      //_.each(mice, function(mouse, i){
      //  mouse.direction = directionAfterArrow(mouse);
      //  var new_direction =  directionAfterWall(mouse);
      //  data = _.extend({}, {$set: {direction: new_direction }}, move(new_direction));
      //  Mice.update(mouse._id, data);
      //  scorePoint(mouse, {$inc: {score: MICE_SCORE}}, Mice);
      //});

      //// Before cats move, mouse collides cat.
      //var cats =  Cats.find().fetch();
      //_.each(cats, function(cat){
      //  var pos = {left: cat.left, top: cat.top};
      //  Mice.find(pos).forEach(function(m){
      //    Mice.remove(m);
      //  });
      //});

      //// Cat move
      //_.each(cats, function(cat){
      //  cat.direction = directionAfterArrow(cat, function(arrow){
      //    var catp = _.pick(cat, 'top', 'left');
      //    console.log('to be removed dbArrows = ', arrow);
      //    Arrows.remove(arrow);
      //    var index = -1;
      //    var arrowId = _.find(arrows, function(a, i){
      //      console.log('a = ' + a +  ' aid = ' + arrow._id);
      //      if ( a == arrow._id ){
      //        index = i;
      //        return true;
      //      }
      //      return false;
      //    });
      //    if (arrowId){
      //      arrows['' + arrow.pid].splice(index, 1);
      //    }
      //  });
      //  var new_direction = directionAfterWall(cat);
      //  data = _.extend({}, {$set: {direction: new_direction }}, move(new_direction));
      //  Cats.update(cat._id, data);
      //  scorePoint(cat, {$inc: {score: -CAT_PUNISH_SCORE}}, Cats);
      //});

      //// cat moved, cat collide with mouse
      //cats =  Cats.find().fetch();
      //_.each(cats, function(cat){
      //  var pos = {left: cat.left, top: cat.top};
      //  Mice.find(pos).forEach(function(m){
      //    Mice.remove(m);
      //  });
      //});


      lock = false;
    } else {
      // Do nothing
    }
  }, 1000);

  /*****************************\
         Spawning loop
  \*****************************/
  var t = 0;
  Meteor.setInterval(function(){
    SpawnPoints.find({}).forEach(function(sp){
      //console.log(sp);
      delete sp._id;
      Mice.insert(sp);
    });

    //t++;
    //console.log(t);
  }, spawningRate);

  Meteor.startup(function () {
    // code to run on server at startup
    resetGame(2);
  });
}

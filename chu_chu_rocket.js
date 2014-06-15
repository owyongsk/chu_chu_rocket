Mice = new Meteor.Collection("mice");
Players = new Meteor.Collection("players");
SpawnPoints = new Meteor.Collection('spawn_points');
Arrows = new Meteor.Collection('arrows');
Destinations = new Meteor.Collection('destinations');

var players = { };
var arrows = {
  '1' : []
  , '2' : []
};

var sps = [
    {player: 1, top: 25, left:25 , direction:'right'}
  , {player: 2, top: 75, left:325, direction:'left'}
  , {player: 1, top: 125, left:25 , direction:'right'}
  , {player: 2, top: 175, left:325, direction:'left'}
];

var destinations = [
    {pid: 1, top:  25, left: 325 }
  , {pid: 2, top:  75, left:  25 }
  , {pid: 1, top: 125, left: 325 }
  , {pid: 2, top: 175, left:  25 }
];

function move(direction){
  switch(direction) {
    case "up":
      return {$inc: {top: -50}}
    case "down":
      return {$inc: {top: 50}}
    case "left":
      return {$inc: {left: -50}}
    case "right":
      return {$inc: {left: 50}}
  }
}

function directionAfterWall(mouse){
  // Corner cases
  if        (mouse.top <= 25  && mouse.left <= 25  && mouse.direction == 'left') {
    return 'right';
  } else if (mouse.top <= 25  && mouse.left >= 325 && mouse.direction == 'up') {
    return 'down';
  } else if (mouse.top >= 175 && mouse.left >= 325 && mouse.direction == 'right') {
    return 'left';
  } else if (mouse.top >= 175 && mouse.left <= 25  && mouse.direction == 'down') {
    return 'up';

  // Wall cases
  } else if (mouse.top  <= 25  && mouse.direction == 'up'){
    return 'right';
  } else if (mouse.top  >= 175 && mouse.direction == 'down'){
    return 'left';
  } else if (mouse.left <= 25  && mouse.direction == 'left'){
    return 'up';
  } else if (mouse.left >= 325 && mouse.direction == 'right'){
    return 'down';
  } else {
    return mouse.direction;
  }
}

function scorePoint(mouse){
  var dst = _.find(destinations, function(dst){
    return mouse.top == dst.top && mouse.left == dst.left;
  });


  if (dst){
    Players.update(players['' + dst.pid], {$inc: {score: 1}});
    Mice.remove(mouse._id);
  }
}

function resetGame(){
  Mice.remove({});    // remove all mice
  Players.remove({}); // remove all players
  SpawnPoints.remove({});
  Arrows.remove({});
  Destinations.remove({});

  _.each(sps, function(sp) {
    SpawnPoints.insert( sp );
    Mice.insert(sp);
  });

  _.each(destinations, function(dst){
    Destinations.insert( dst );
  });

  players['1'] = Players.insert({
    number: 1,
    score: 0
  });
  players['2'] = Players.insert({
    number: 2,
    score: 0
  });
}

if (Meteor.isClient) {
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

  //Template.ccr.events({
  //  'click #game .cell': function () {
  //    console.log('clicked');
  //  }
  //});
}

var canPutArrow = function(pid, pos){
  // center
  var x = Math.floor(pos.x / 50) * 50 + 25;
  var y = Math.floor(pos.y / 50) * 50 + 25;

  var conflictedSp = _.find(sps, function(sp, i){
    return sp.top == y && sp.left == x;
  });

  if (conflictedSp){
    return false;
  }

  //var arr
  return true;
}

Meteor.methods({
  addArrow: function(playerId, pos, direction){
    if (canPutArrow(playerId, pos)){
      if (arrows[playerId].length >= 3){
        var firstArrowId = arrows[playerId].shift();
        Arrows.remove({_id: firstArrowId});
      }
      var x = Math.floor(pos.x / 50) * 50 + 25;
      var y = Math.floor(pos.y / 50) * 50 + 25;
      var aid = Arrows.insert({top: y, left: x, direction: direction, pid: playerId});
      arrows[playerId].push(aid);
      return aid;
    }
    return '';
  },
  resetGame: function(){
    resetGame();
  }
});

var directionAfterArrow = function(mouse){
  var arrow = Arrows.findOne({top: mouse.top, left: mouse.left});
  //console.log(arrow);
  if (arrow){
    return arrow.direction;
  }

  return mouse.direction;
}

if (Meteor.isServer) {
  var spawningRate = 1000;
  var lock = false;
  Meteor.setInterval(function() {
    if (lock == false){
      lock = true;
      var toUpdate = [];
      Mice.find({}).forEach(function (mouse) {
        mouse.direction = directionAfterArrow(mouse);
        var new_direction =  directionAfterWall(mouse);
        data = _.extend({}, {$set: {direction: new_direction }}, move(new_direction));
        Mice.update(mouse._id, data);
        scorePoint(mouse);
      });
      lock = false;
    } else {
      // Do nothing
    }
  }, 1000);

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
    resetGame();
  });
}

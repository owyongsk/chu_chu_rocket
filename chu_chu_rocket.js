Mice = new Meteor.Collection("mice");
Players = new Meteor.Collection("players");

SpawnPoints = [[25,25,'right'],[75,325,'left']] // only two

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
  if (mouse.top == 25 && mouse.direction == 'up'){
    return 'right';
  } else if (mouse.top == 175 && mouse.direction == 'down') {
    return 'left';
  } else if (mouse.left == 25 && mouse.direction == 'left') {
    return 'up';
  } else if (mouse.left == 325 && mouse.direction == 'right') {
    return 'down';
  } else {
    return mouse.direction
  }
}

function scorePoint(mouse){
  if (mouse.top == 75 && mouse.left == 25){
    Players.update(Players.findOne({number: 1})._id, {$inc: {score: 1}});
  } else if (mouse.top == 175 && mouse.left == 25) {
    Players.update(Players.findOne({number: 1})._id, {$inc: {score: 1}});
  } else if (mouse.top == 25 && mouse.left == 325) {
    Players.update(Players.findOne({number: 2})._id, {$inc: {score: 1}});
  } else if (mouse.top == 125 && mouse.left == 325) {
    Players.update(Players.findOne({number: 2})._id, {$inc: {score: 1}});
  } else {
    return;
  }
  Mice.remove(mouse._id);
}

if (Meteor.isClient) {
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

  // Template.ccr.events({
    // 'click input': function () {
      // Mice.update(Mice.findOne()._id, {$set: {direction: "right"}})
    // }
  // });
}

if (Meteor.isServer) {
  Meteor.setInterval(function() {
    Mice.find({}).forEach(function (mouse) {
      var new_direction = directionAfterWall(mouse);
      Mice.update(mouse._id, {$set: {direction: new_direction }});
      Mice.update(mouse._id, move(new_direction));
      // scorePoint(mouse);
    });
  }, 1000)

  Meteor.startup(function () {
    // code to run on server at startup

    Mice.remove({});    // remove all mice
    Players.remove({}); // remove all players

    _.each(SpawnPoints, function(sp) {
      Mice.insert({
        top: sp[0],
        left: sp[1],
        direction: sp[2]
      });
    });

    Players.insert({
      number: 1,
      score: 0
    });
    Players.insert({
      number: 2,
      score: 0
    });
  });
}

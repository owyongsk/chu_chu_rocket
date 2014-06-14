Mice = new Meteor.Collection("mice");

SpawnPoints = [[25,25],[25,125]] // only two

function move(direction){
  switch(direction) {
    case "up":
      return {$inc: {top: -2.5}}
    case "down":
      return {$inc: {top: 2.5}}
    case "left":
      return {$inc: {left: -2.5}}
    case "right":
      return {$inc: {left: 2.5}}
  }
}

function directionAfterWall(mouse){
  if (mouse.top == 25 && mouse.direction == 'up'){
    return 'right'
  } else if (mouse.top == 175 && mouse.direction == 'down') {
    return 'left'
  } else if (mouse.left == 25 && mouse.direction == 'left') {
    return 'up'
  } else if (mouse.left == 325 && mouse.direction == 'right') {
    return 'down'
  } else {
    return mouse.direction
  }
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
    });
  }, 50)

  Meteor.startup(function () {
    // code to run on server at startup

    Mice.remove({}); // remove all mice

    Mice.insert({    // insert one mice
      direction: "right",
      left: 25,
      top: 25
    });
  });
}

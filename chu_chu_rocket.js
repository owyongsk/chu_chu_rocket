Grids = new Meteor.Collection("grids");
Mice = new Meteor.Collection("mice");

SpawnPoints = [[25,25],[25,125]] // only two

if (Meteor.isClient) {
  Template.ccr.mice = function() {
    return Mice.find();
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
      Mice.update(mouse._id, move(mouse.direction));
    });
  }, 1000)

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

# Introduction
This is a game developed by [SK](skowyong@gmail.com),
[Connie](cleung334@gmail.com) and [Edward](edwardfung123@gmail.com) during the
hackathon in 2014 organized Codeacholics (http://codeaholics.hk/).

The idea of this game is **not something new**. We **shamelessly** copy the
game called "ChuChu Rocket!" by Sega. In case, you don't know this game (very
likely). Here is the [original ChuChu Rocket multiplayer game play video](http://youtu.be/WHBsA-PZXiA?t=19s).

This project is implemented with [Meteor](http://meteor.com/). You can play 
our game [here](http://chu-chu-rocket.meteor.com/?id=1). You can switch to player 2,3 and 4
by changing the id in the URL to 2,3,4 respectively.

# Game Description
## Objects in this game:
1. Mice
2. Cats
3. Spawning Points
4. Destinations
5. Arrows

## The objectives of this game:
Use arrows to redirect the mice to your own destination to get higher score and prevent the cat
from entering your destination.

# Game Play
The game is hosted on [Meteor](http://chu-chu-rocket.meteor.com/?id=1).
So far, we use different to switch players:

* [Player1](http://chu-chu-rocket.meteor.com/?id=1)
* [Player2](http://chu-chu-rocket.meteor.com/?id=2)
* [Player3](http://chu-chu-rocket.meteor.com/?id=3)
* [Player4](http://chu-chu-rocket.meteor.com/?id=4)

Each players can have maximum 3 arrows. 
To place an arrow, simply move your mouse on the grid and press W, A, S or D to place UP, LEFT, DOWN, RIGHT arrow.
The arrows are FIFO. That means if you place the 4th arrow, the 1st arrow will be cancelled.

Any cat stepped on the arrow will cancel the arrow.

Cats will eat the mice. Cats are spawned randomly.

Whenever the cat or the mouse hit the wall, they will turn RIGHT first according to their own direction.

# FAQ
* Are we going to continue the game?
  * Maybe.

# Milestones
* Add walls
* Add pitfalls
* Optimize the game to allow more mice and players - May need to port it to socket.io?
* Set a timer for the game - The game just runs forever now...
* Game room
* Better graphics!
* Documentation
* Arrow has a life - The arrow can be stepped by the cat twice in the original game 
* Cats and mice have different movement speed - The cat moves slower in the original game
* Scale the map with smaller devices, e.g. mobile phone
* The game cannot be played with mobile phone.


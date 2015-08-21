var User = require('./User');

function Room(roomCode) {
    var self = this;
    self.id = roomCode;
    self.usersInRoom = [];
    self.gameController = undefined;
    self.botsInRoom = [];
    self.messages = [];
    self.numRounds = 8;

    /*
        Returns a user from the room
    */
    self.getUsersInRoom = function(userId) {
        var user;

        self.usersInRoom.forEach(function(userInRoom) {
            if (userInRoom.uId === userId) {
                user = userInRoom;
            }
        });

        return user;
    };

    self.submitMessage = function(data) {

        if (self.gameController === undefined) {

            if (data.messageText !== undefined ) {

                if (data.messageText.trim() !== '') {

                    var message = {
                        playerName: data.playerName,
                        playerUid: data.playerUid,
                        messageText: data.messageText
                    };

                    self.messages.push(message);

                    return true;
                }
            }
        }

        return false;
    };

    /*
        Adds the required number of bots to the room
    */
    self.setBotNumber = function(num) {

        var numBotsInRoom = self.botsInRoom.length;

        if(num > numBotsInRoom){
            // add more bots

            // Create required number of bots
            // bots are just user objects with no socket
            for(var i = 0; i < (num - numBotsInRoom); i++){
                var newBot = new User({});
                newBot.name = "BOT " + (numBotsInRoom + i + 1);
                newBot.isBot = true;
                self.botsInRoom.push(newBot);
            }

        } else if( num < self.botsInRoom.length) {

            // remove the required number of bots
            for(var j = 0; j < (numBotsInRoom - num ); j++){
                self.botsInRoom.pop();
            }
        } else {
            //correct number of bots in room
        }
    };


    /*
    Attempts to put a user in the room

    Does not put the user in if
        They are already in it
        A game has started and they were not previosuly in that game
*/
    self.addUser = function(user) {

        var canJoin = true;
        var userAlreadyInRoom = false;
        var gameInProgress = true;
        var routing = "";

        // Only join the room if user not already in ANY room
        // Handles user pressing join room multiple times
        self.usersInRoom.forEach(function(userInRoom) {
            if (userInRoom.uId === user.uId) {
                //USER IS ALREADY IN self ROOM, THEY CANNOT JOIN
                userAlreadyInRoom = true;
                canJoin = false;
                errorText = "already in room";
            }
        });

        user.emit("ROOM messages", self.messages);

        // Check if room has a game in proress
        if (self.gameController === undefined && canJoin) {

            gameInProgress = false;
            routing = "room";

        } else {

            // Check if user was in the game
            var userInGame = self.gameController.checkIfUserInGame(user.uId);

            if (userInGame) {

                //User was in the game, tell the game controller they're back, route them to the current stage
                // Find out where to put this user, i.e where all the other players are
                self.gameController.getInfoForReconnectingUser(user.uId, function(routingInfo, gameStateData) {

                    routing = routingInfo;

                    // Send to the user all the information about the game
                    // Needed so they can start playing straight away
                    gameStateData.forEach(function(data) {
                        user.emit(data.eventName, data.data);
                    });
                });

            } else {
                // Can't join a game in progress they wern't in
                gameInProgress = true;
                canJoin = false;
            }
        }

        // Put the user into the room if all checks passed
        if (canJoin) {

            user.roomId = self.id;
            self.usersInRoom.push(user);

             // Route them to the room lobby
            user.emit('ROUTING', {
                location: routing
            });

            // Tell the user they have joined
            user.emit('USER room join', {
                success: true,
                roomId: self.id
            });

            //Update the room service of every user
            self.broadcastRoom("ROOM details");
        }

        // Return wether the join was successful or not
        return {
            gameInProgress: gameInProgress,
            userAlreadyInRoom: userAlreadyInRoom,
            joined: canJoin
        };
    };


    self.removeUser = function(user) {

        self.usersInRoom = self.usersInRoom.filter(function(userInRoom) {
            return userInRoom.uId !== user.uId;
        });

        // Take the user out of the game (set as disconnected)
        if (self.gameController !== undefined) {
            self.gameController.disconnectPlayer(user.uId);
        }

        self.broadcastRoom("ROOM details");
    };

    /*
        Emits a message to all users in the room
    */
    self.broadcastRoom = function(eventName, data) {


        if (eventName === "ROOM details") {
            var usersInRoomJSON = [];

            self.usersInRoom.forEach(function(user) {
                usersInRoomJSON.push(user.getUserDetails());
            });

            data = {
                roomId: self.id,
                usersInRoom: usersInRoomJSON,
                botsInRoom: self.botsInRoom,
                numRounds: self.numRounds
            };

        }

        else if (eventName === "ROOM messages") {
            data = self.messages ;

        }

        self.usersInRoom.forEach(function(user) {
            user.emit(eventName, data);
        });
    };
}

module.exports = Room;

function Room(roomCode) {
    this.id = roomCode;
    this.usersInRoom = [];
    this.gameController = undefined;
}

/*
    Returns a user from the room
*/
Room.prototype.getUserInRoom = function(userId) {
    var user;

    this.usersInRoom.forEach(function(userInRoom) {
        if (userInRoom.uId === userId) {
            user = userInRoom;
        }
    });

    return user;
};


/*
    Attempts to put a user in the room

    Does not put the user in if
        They are already in it
        A game has started and they were not previosuly in that game
*/
Room.prototype.addUser = function(user) {

    var canJoin = true;
    var userAlreadyInRoom = false;
    var gameInProgress = true;

    // Only join the room if user not already in ANY room
    // Handles user pressing join room multiple times
    this.usersInRoom.forEach(function(userInRoom) {
        if (userInRoom.uId === user.uId) {
            //USER IS ALREADY IN THIS ROOM, THEY CANNOT JOIN
            userAlreadyInRoom = true;
            canJoin = false;
            errorText = "already in room";
        }
    });

    // Check if room has a game in proress
    if (this.gameController === undefined && canJoin) {

        // Route them to the room lobby
        user.emit('ROUTING', {
            location: 'room'
        });

        gameInProgress = false;

    } else {

        // Check if user was in the game
        var userInGame = this.gameController.checkIfUserInGame(user.uId);

        if (userInGame) {

            //User was in the game, tell the game controller they're back, route them to the current stage
            // Find out where to put this user, i.e where all the other players are
            this.gameController.getInfoForReconnectingUser(user.uId, function(routingInfo, gameStateData) {

                //Put them to the page everyone is on
                user.emit('ROUTING', {
                    location: routingInfo
                });

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

        user.roomId = this.id;
        this.usersInRoom.push(user);

        // Tell the user they have joined
        user.emit('USER room join', {
            success: true,
            roomId: this.id
        });

        //Update the room service of every user
        this.broadcastRoom("ROOM details");
    }

    // Return wether the join was successful or not
    return {
        gameInProgress: gameInProgress,
        userAlreadyInRoom: userAlreadyInRoom,
        joined: canJoin
    };
};

Room.prototype.removeUser = function(user) {

    this.usersInRoom = this.usersInRoom.filter(function(userInRoom) {
        return userInRoom.uId !== user.uId;
    });

    // Take the user out of the game (set as disconnected)
    if (this.gameController !== undefined) {
        this.gameController.disconnectPlayer(user.uId);
    }

    this.usersInRoom = this.usersInRoom.filter(function(userInRoom) {
        return userInRoom.uId !== user.uId;
    });

    this.broadcastRoom("ROOM details");
};

/*
    Emits a message to all users in the room
*/
Room.prototype.broadcastRoom = function(eventName, data) {


    if (eventName === "ROOM details") {
        var usersInRoom = [];

        this.usersInRoom.forEach(function(user) {
            usersInRoom.push(user.getUserDetails());
        });

        data = {
            roomId: this.id,
            usersInRoom: usersInRoom
        };

    }

    this.usersInRoom.forEach(function(user) {
        user.emit(eventName, data);
    });
};

module.exports = Room;

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

Room.prototype.addUser = function(user) {
    this.usersInRoom.push(user);
};

Room.prototype.removeUser = function(user) {
    this.usersInRoom = this.usersInRoom.filter(function(userInRoom) {
        return userInRoom.uId !== user.uId;
    });
};

/*
    Emits a message to all users in the room
*/
Room.prototype.broadcastRoom = function(eventName, data) {


    if(eventName === "ROOM details") {
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

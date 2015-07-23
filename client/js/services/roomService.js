ClonageApp.service('roomService', ['socket', '$sessionStorage', function(socket, $sessionStorage) {

    var roomId = -1;
    var usersInRoom = [];

    //--------------------
    //PUBLIC API
    //-------------------

    function createRoom(playerId) {
        socket.emit("ROOM create", {
            playerId: playerId
        });

    }

    function joinRoom(roomId) {
        socket.emit('ROOM join', {
            roomId: roomId
        });
    }

    function getUsersInRoom() {
        console.log(usersInRoom);
        return usersInRoom;
    }

    function leaveRoom() {
        socket.emit('ROOM leave', {
            roomId: roomId
        });
    }

    function getRoomId() {
        return roomId;
    }


    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------


    socket.on("ROOM details", function(data) {
        roomId = data.roomId;
        usersInRoom = data.usersInRoom;
        console.log("users in room, below");
        console.log(usersInRoom);
    });

    return {
        createRoom: createRoom,
        joinRoom: joinRoom,
        usersInRoom: usersInRoom,
        getUsersInRoom: getUsersInRoom,
        leaveRoom: leaveRoom,
        getRoomId: getRoomId
    };

}]);
ClonageApp.service('roomService', ['socket', '$sessionStorage', function(socket, $sessionStorage) {

    var roomId = -1;
    var usersInRoom = [];
    var gameInProgress = false;

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

    function getGameInProgess(){
        return gameInProgress;
    }

    socket.on("ROOM details", function(data) {
        roomId = data.roomId;
        usersInRoom = data.usersInRoom;
        gameInProgress = data.gameInProgress;
    });

    return {
        createRoom: createRoom,
        joinRoom: joinRoom,
        usersInRoom: usersInRoom,
        getUsersInRoom: getUsersInRoom,
        leaveRoom: leaveRoom,
        getRoomId: getRoomId,
        getGameInProgress: getGameInProgess
    };

}]);
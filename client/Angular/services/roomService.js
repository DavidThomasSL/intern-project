ClonageApp.service('roomService', ['socket', '$sessionStorage', function(socket, $sessionStorage) {

    var roomId = -1;
    var usersInRoom = [];
    var gameInProgress = false;
    var errorMessage = "";

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
        errorMessage = "";
    }

    function getUsersInRoom() {
        // console.log(usersInRoom);
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

    function getGameInProgess(){
        return gameInProgress;
    }

    function getErrorMessage(){
        if(errorMessage !== ""){
            return errorMessage;
        }
    }

    socket.on("ROOM details", function(data) {
        roomId = data.roomId;
        usersInRoom = data.usersInRoom;
        gameInProgress = data.gameInProgress;
    });

    socket.on("ROOM error", function(data) {
        errorMessage = data.msg;
    });

    return {
        createRoom: createRoom,
        joinRoom: joinRoom,
        usersInRoom: usersInRoom,
        getUsersInRoom: getUsersInRoom,
        leaveRoom: leaveRoom,
        getRoomId: getRoomId,
        getGameInProgress: getGameInProgess,
        getErrorMessage: getErrorMessage
    };

}]);

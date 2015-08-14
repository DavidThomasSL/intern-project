ClonageApp.service('roomService', ['communicationService', '$sessionStorage', function(communicationService, $sessionStorage) {

    /*
    --------------------
        PUBLIC API
        These are functions exposed by the service to the outside work i.e controllers,
        and others who who use this service
    -------------------
    */

    var roomId = -1;
    var usersInRoom = [];
    var errorMessage = "";
    var botNumber = 0;
    var numRounds = 0;

    function createRoom(playerId) {
        sendMessage("ROOM create", {
            playerId: playerId
        });
    }

    function joinRoom(roomId) {
        sendMessage('ROOM join', {
            roomId: roomId
        });
        errorMessage = "";
    }

    function getUsersInRoom() {
        return usersInRoom;
    }

    function leaveRoom() {
        sendMessage("ROOM leave", {
            roomId: roomId
        });
    }

    function getRoomId() {
        return roomId;
    }

    // function setBotNumber(number) {
    //     botNumber = number;
    //     sendMessage('ROOM setBotNumber', {
    //         botNumber: botNumber,
    //         roomId: roomId
    //     });
    //     return;
    // }

    function setGameParameters(r, b) {
        botNumber = b;
        numRounds = r;
        sendMessage('ROOM setGameParameters', {
            botNumber: botNumber,
            numRounds: numRounds,
            roomId: roomId
        });
        return;
    }

    function getGameParameters() {
        return {
            numRounds: numRounds,
            botNumber: botNumber
        };
    }

    // function getBotNumber() {
    //     return botNumber;
    // }

    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------


    function getErrorMessage() {
        if (errorMessage !== "") {
            return errorMessage;
        }
    }

    /*
    ---------------
        COMMUNCATION LAYER API
        These are functions called by the communcation
        service when it recives a message for the user service
    ---------------
    */

    function _setRoomDetails(data) {
        roomId = data.roomId;
        usersInRoom = data.usersInRoom;
        botNumber = data.botNumber;
        numRounds = data.numRounds;

        //add on canvas control elements to each user
        //Allows the canvas to access the user's image
        usersInRoom.forEach(function(user) {
            user.canvasControl = {
                getUserImage: function() {
                    return user.image;
                }
            };
        });
    }

    function _setError(data) {
        errorMessage = data.msg;
    }

    /*
    ---------------
        REGISTERING COMMUNCATION API WITH LAYER
        Must register the user service with the communcation service,
        and provide an api to call back when recieving an event
    ----------------
    */

    communicationService.registerListener("ROOM", [{
        eventName: "details",
        eventAction: _setRoomDetails
    }]);

    /*
    -------------------
    INTERNAL HELPER FUNCTIONS
    -----------------
    */

    function sendMessage(eventName, data, callback) {
        if (callback === undefined) {
            callback = function() {};
        }
        communicationService.sendMessage(eventName, data, callback);
    }

    return {
        createRoom: createRoom,
        joinRoom: joinRoom,
        usersInRoom: usersInRoom,
        getUsersInRoom: getUsersInRoom,
        leaveRoom: leaveRoom,
        getRoomId: getRoomId,
        getGameParameters: getGameParameters,
        setGameParameters: setGameParameters,
        _setRoomDetails: _setRoomDetails
    };

}]);

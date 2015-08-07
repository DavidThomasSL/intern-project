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
    var botsEnabled = false;
    var botListener = function(){};

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

    function toggleBotStatus () {
        botsEnabled = !botsEnabled;
        sendMessage('ROOM toggleBots', {roomId: roomId});
        return;
    }

    function registerListener(callback) {
        botListener = callback;
    }

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
        botsEnabled = data.botsEnabled;

        // Tell the controller listener that the bots have changed
        botListener(botsEnabled);
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
        botsStatus: botsEnabled,
        toggleBotStatus: toggleBotStatus,
        registerListener: registerListener,
        getRoomId: getRoomId,
        _setRoomDetails: _setRoomDetails
    };

}]);

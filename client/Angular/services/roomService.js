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
    var messages = [];
    var numRounds = 8;
    var botsInRoom = [];

    function createRoom(playerId) {
        sendMessage("ROOM create", {
            playerId: playerId
        });
    }

    /*
        Attempt to put a user into a room
        Can force themselves in, which lets them join any room, but only as an observer
    */
    function joinRoom(roomId, force) {

        if(force === undefined){
            force = false;
        }

        sendMessage('ROOM join', {
            roomId: roomId,
            force: force
        });
        errorMessage = "";
    }

    function joinRoomForce(roomId) {
        joinRoom(roomId, true);
    }

    function getUsersInRoom() {
        return usersInRoom;
    }

    function getUserFromId(userId) {
        var userToReturn = undefined;
        getActiveUsersInRoom().forEach(function(activeUser) {
            if(activeUser.uId == userId) {
                userToReturn = activeUser;
            }
        });
        getBotsInRoom().forEach(function(currentBot) {
            if(currentBot.uId === userId) {
                userToReturn = currentBot;
            };
        });
        return userToReturn;
    }


    //returns the array of all users who aren't observers
    function getActiveUsersInRoom() {
        var userList = usersInRoom.filter(function(userInRoom){
            return (!userInRoom.isObserver);
        });
        return userList;
    }

    //returns the array of all observers in the room
    function getObserversInRoom() {
        var observerList = usersInRoom.filter(function(userInRoom) {
            return (userInRoom.isObserver);
        });
        return observerList;
    }

    function getBotsInRoom() {
        return botsInRoom;
    }

    function leaveRoom() {
        sendMessage("ROOM leave", {
            roomId: roomId
        });
    }

    function getRoomId() {
        return roomId;
    }

    function setBotNumber(num) {
        botNumber = num;
        sendMessage('ROOM setGameParameters', {
            botNumber: botNumber,
            numRounds: numRounds,
            roomId: roomId
        });
        return;
    }

    function setRoundNumber(num) {
        numRounds = num;
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

    function getMessages() {
        return messages;
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
        botsInRoom = data.botsInRoom;
        botNumber = botsInRoom.length;
        numRounds = data.numRounds;
    }

    function _setMessages(data) {
        messages = data ;
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
    }, {
        eventName: "messages",
        eventAction: _setMessages
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
        joinRoomForce: joinRoomForce,
        usersInRoom: usersInRoom,
        getUsersInRoom: getUsersInRoom,
        getUserFromId: getUserFromId,
        getActiveUsersInRoom: getActiveUsersInRoom,
        getObserversInRoom: getObserversInRoom,
        leaveRoom: leaveRoom,
        getRoomId: getRoomId,
        _setMessages: _setMessages,
        getMessages: getMessages,
        getGameParameters: getGameParameters,
        setBotNumber: setBotNumber,
        getBotsInRoom: getBotsInRoom,
        setRoundNumber: setRoundNumber,
        _setRoomDetails: _setRoomDetails
    };

}]);

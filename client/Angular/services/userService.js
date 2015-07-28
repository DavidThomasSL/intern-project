ClonageApp.service('userService', ['$sessionStorage', 'communicationService',
    function($sessionStorage, communicationService) {

        /*
        --------------------
            PUBLIC API
            These are functions exposed by the service to the outside work i.e controllers,
            and others who who use this service
        -------------------
        */

        var user = {};
        var gameHand = {};

        //call function that emits to server the answer that was just submitted
        function submitChoice(enteredAnswer) {
            _emitChoice(enteredAnswer);
        }

        //call function that emits to server the vote that was just submitted
        function submitVote(enteredAnswer) {
            _emitVote(enteredAnswer);
        }

        function getUserName() {
            return user.name;
        }

        function getUserId() {
            return user.uId;
        }

        function getUserHand() {
            return gameHand;
        }

        function setName(name) {
            sendMessage('USER set name', {
                name: name
            });
        }

        /*
        ---------------
            COMMUNCATION LAYER API
            These are functions called by the communcation
            service when it recives a message for the user service
        ---------------
        */

        //Called by the communication service, when socket.io initially connects
        //MAGIC, DON'T TRY TO UNDERSTAND
        function _registerUser() {
            sendMessage('USER register', {
                token: $sessionStorage.userId
            });
        }

        function _setUserDetails(data) {
            user = data.user;
            $sessionStorage.userId = user.uId;
            $sessionStorage.roomId = user.roomId;
        }

        function _joinRoom(data) {
            $sessionStorage.roomId = data.roomId;
            user.roomId = data.roomId;
            userInRoom = true;
        }

        function _setHand(data) {
            gameHand = data.hand;
        }

        /*
        ---------------
            REGISTERING COMMUNCATION API WITH LAYER
            Must register the user service with the communcation service,
            and provide an api to call back when recieving an event
        ----------------
        */

        communicationService.registerListener("USER", [{
            eventName: "connect",
            eventAction: _registerUser
        }, {
            eventName: "details",
            eventAction: _setUserDetails
        }, {
            eventName: "room join",
            eventAction: _joinRoom
        }, {
            eventName: "hand",
            eventAction: _setHand
        }]);


        /*
        -------------------
        INTERNAL HELPER FUNCTIONS
        -----------------
        */

        //emit the answer that was just submitted: who submitted what and what room they are in
        function _emitChoice(answer) {
            sendMessage('USER submitChoice', {
                playerId: user.uId,
                playerName: user.name,
                answer: answer,
                roomId: user.roomId
            });
        }

        //emit the vote that was just submitted: who voted for what and what room they are in
        function _emitVote(answer) {
            sendMessage('USER vote', {
                playerId: user.uId,
                playerName: user.name,
                answer: answer,
                roomId: user.roomId
            });
        }

        function sendMessage(eventName, data, callback) {
            if (callback === undefined) {
                callback = function() {};
            }
            communicationService.sendMessage(eventName, data, callback);
        }

        return {
            setName: setName,
            getUserName: getUserName,
            getUserId: getUserId,
            getUserHand: getUserHand,
            submitChoice: submitChoice,
            submitVote: submitVote,
            _setUserDetails: _setUserDetails,
            _setHand: _setHand,
            _joinRoom: _joinRoom,
            _registerUser: _registerUser
        };

    }
]);

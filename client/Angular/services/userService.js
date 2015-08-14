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
        var rank = "";


        //call function that emits to server the vote that was just submitted
        function submitVote(answer) {
            _emitVote(answer);
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

        function getUserImage() {
            return user.image;
        }

        function setName(name) {
            sendMessage('USER set name', {
                name: name
            });
        }

        function setNameAndImage(name, image) {
            console.log("sent name and image");
            sendMessage('USER set profile', {
                name: name,
                image: image
            });
        }

        function getRank() {
            return rank;
        }

        function setRank(scores) {
            scores.forEach(function(score) {
                if (score.playerId === user.uId) {
                    rank = score.rank;
                }
            });
        }

        function submitMessage(messageText) {
            sendMessage('USER send message', {
                playerName: user.name,
                playerUid: user.uId,
                messageText: messageText,
                roomId: user.roomId
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
            getRank: getRank,
            setRank: setRank,
            setNameAndImage: setNameAndImage,
            getUserImage: getUserImage,
            _setUserDetails: _setUserDetails,
            _setHand: _setHand,
            _joinRoom: _joinRoom,
            _registerUser: _registerUser,
            sendMessage: submitMessage
        };

    }
]);

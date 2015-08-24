ClonageApp.service('userService', ['$sessionStorage', 'communicationService', 'toastr'
    function($sessionStorage, communicationService, toastr) {

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

        function getUserName() {
            return user.name;
        }

        function getIfObserver() {

            var isObserver;
            if (user.isObserver===undefined){
                isObserver = false;
            } else {
                isObserver = user.isObserver;
            }
            return isObserver;
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

        function setNameAndImage(name, image) {
            sendMessage('USER set profile', {
                name: name,
                image: image,
                isObserver: false
            });
        }
        function registerNewObserver(name, image) {
            sendMessage('USER set profile', {
                name: name,
                image:image,
                isObserver: true
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

        function getRoomId() {
            return user.roomId;
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

        function _playAgain(newRoomId) {

            toastr.success('One of your friends wants to play again.<br> Click here to join', {
                allowHtml: true,
                showCloseButton: true,
                timeout:   null,
                onHidden: function(clicked) {
                    if (clicked) { alert("yes!"); }
                }
            });

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
            eventName: "room join",
            eventAction: _joinRoom
        }, {
            eventName: "play again",
            eventAction: _playAgain
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
            getUserName: getUserName,
            getUserId: getUserId,
            getRoomId: getRoomId,
            getUserHand: getUserHand,
            getRank: getRank,
            setRank: setRank,
            getIfObserver: getIfObserver,
            setNameAndImage: setNameAndImage,
            registerNewObserver: registerNewObserver,
            getUserImage: getUserImage,
            _setUserDetails: _setUserDetails,
            _setHand: _setHand,
            _joinRoom: _joinRoom,
            _registerUser: _registerUser,
            sendMessage: submitMessage
        };

    }
]);

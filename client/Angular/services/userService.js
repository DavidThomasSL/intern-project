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
            emitChoice(enteredAnswer);
        }

        //call function that emits to server the vote that was just submitted
        function submitVote(enteredAnswer) {
            emitVote(enteredAnswer);
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
            }, function() {});
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
        function registerUser() {
            sendMessage('USER register', {
                token: $sessionStorage.userId
            }, function() {
                console.log("sent user registeration request");
            });
        }

        function setUserDetails(data) {
            user = data.user;
            $sessionStorage.userId = user.uId;
            $sessionStorage.roomId = user.roomId;
            console.log("Got user details from server CORRECTLY" + user.uId);
        }

        function joinRoom(data) {
            $sessionStorage.roomId = data.roomId;
            user.roomId = data.roomId;
            userInRoom = true;
        }

        function setHand(data) {
            gameHand = data.hand;
            console.log("got game hand CORRECTLY");
            console.log(gameHand);
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
            eventAction: registerUser
        }, {
            eventName: "details",
            eventAction: setUserDetails
        }, {
            eventName: "room join",
            eventAction: joinRoom
        }, {
            eventName: "hand",
            eventAction: setHand
        }]);

        /*
        -------------------
        INTERNAL HELPER FUNCTIONS
        -----------------
        */

        //emit the answer that was just submitted: who submitted what and what room they are in
        function emitChoice(answer) {
            sendMessage('USER submitChoice', {
                playerId: user.uId,
                answer: answer,
                roomId: user.roomId
            });
        }

        //emit the vote that was just submitted: who voted for what and what room they are in
        function emitVote(answer) {
            sendMessage('USER vote', {
                playerId: user.uId,
                answer: answer,
                roomId: user.roomId
            });
        }

        function sendMessage(eventName, data, callback) {
            if( callback === undefined){
                callback = function(){};
            }
            communicationService.sendMessage(eventName, data, callback);
        }

        return {
            setName: setName,
            getUserName: getUserName,
            getUserId: getUserId,
            getUserHand: getUserHand,
            submitChoice: submitChoice,
            submitVote: submitVote
        };

    }
]);

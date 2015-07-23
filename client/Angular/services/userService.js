ClonageApp.service('userService', ['socket', '$sessionStorage', function(socket, $sessionStorage) {

    var user = {};
    var gameHand = {};


    //--------------------
    //PUBLIC API
    //-------------------

    function registerUser() {
        socket.emit('USER register', {
            token: $sessionStorage.userId
        });
    }

    function submitAnswer(enteredAnswer) {
        emitAnswer(enteredAnswer);
    }

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

    //----------------------
    //SOCKET EVENT LISTENERS
    //-=-----------------

    /*
        When the client connects, we need to register him with the server properly
        IF the user has exisiting details, we send that, and set up his user details
    */
    socket.on('connect', function(msg) {
        console.log("connected");
        registerUser();
    });

    socket.on('USER details', function(msg) {
        user = msg.user;
        $sessionStorage.userId = user.uId;
        $sessionStorage.roomId = user.roomId;
    });

    socket.on("USER room join", function(data) {
        $sessionStorage.roomId = data.roomId;
        user.roomId = data.roomId;
        userInRoom = true;
    });

    socket.on('USER hand', function(data) {
        gameHand = data.hand;
    });

    //-------------------
    //INTERNAL HELPER FUNCTIONS
    //-----------------

    function emitAnswer(answer) {
        socket.emit('USER answer', {
            playerId: user.uId,
            answer: answer,
            roomId: user.roomId
        });
    }

    function emitVote(answer) {
        socket.emit('USER vote', {
            playerId: user.uId,
            answer: answer,
            roomId: user.roomId
        });
    }

    function setName(name) {
        socket.emit('USER set name', {
            name: name
        });
    }

    return {
        setName: setName,
        getUserName: getUserName,
        getUserId: getUserId,
        getUserHand: getUserHand,
        submitAnswer: submitAnswer,
        submitVote: submitVote
    };

}]);



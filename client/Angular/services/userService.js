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

    //emit the answer that was just submitted: who submitted what and what room they are in
    function emitChoice(answer) {
    socket.emit('USER submitChoice', {
            playerId: user.uId,
            answer: answer,
            roomId: user.roomId
        });
    }

    //emit the vote that was just submitted: who voted for what and what room they are in
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
        submitChoice: submitChoice,
        submitVote: submitVote
    };

}]);



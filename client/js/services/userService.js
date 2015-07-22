ClonageApp.service('userService', ['socket', '$sessionStorage', function(socket, $sessionStorage) {

    var user = {};
    var gameHand = {};

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
        console.log("Got user details from server " + user.uId);
        console.log(user);
    });

    socket.on("USER room join", function(data) {
        $sessionStorage.roomId = data.roomId;
        userInRoom = true;
    });

    socket.on('USER hand', function(data) {
        gameHand = data.hand;
        console.log("got game hand");
        console.log(gameHand);
    });

    function registerUser() {
        socket.emit('USER register', {
            token: $sessionStorage.userId
        });
    }

    function submitAnswer(enteredAnswer) {
        emitAnswer(enteredAnswer);
    }

    function submitVote(enteredAnswer) {
        alert(enteredAnswer);
         emitVote(enteredAnswer);
    }

    function emitAnswer(answer){
        socket.emit('USER answer', {
            playerId: $sessionStorage.userId,
            answer: answer,
            roomId: $sessionStorage.roomId
        });
    }

    function emitVote(answer){
        socket.emit('USER vote', {
            playerId: $sessionStorage.userId,
            answer: answer,
            roomId: $sessionStorage.roomId
        });
    }

    function setName(name) {
        socket.emit('USER set name', {
            name: name
        });
    }

    function getUserName() {
        return user.name;
    }

    function getUserId() {
        return user.id;
    }

    function getUserHand() {
        return gameHand;
    }

    return {
        hello: function() {
            console.log("hello");
        },
        setName: setName,
        getUserName: getUserName,
        getUserId: getUserId,
        getUserHand: getUserHand,
        submitAnswer: submitAnswer,
        submitVote: submitVote
    };
}]);

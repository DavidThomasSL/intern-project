var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var log4js = require('log4js');

var logger = log4js.getLogger();

var GameController = require('./GameController');

module.exports = function(port, enableLogging) {
    var router = express();
    var server = http.createServer(router);
    var io = socketio.listen(server, {
        log: enableLogging
    });

    io.set('log level', 1);

    if (enableLogging) {
        logger.setLevel('ALL');
    } else {
        logger.setLevel('INFO');
    }


    router.use(express.static(path.resolve(__dirname, '../client')));

    var rooms = [];
    var messages = [];
    var users = [];
    var uId = 0;
    var roomId = 0;

    io.on('connection', function(socket) {
        //create a new user for the connection
        var user = {};

        /*  client requests to join,
            send the uId to the player
            if the player already has a session token,
            they will respond that they have an id,
            and we retrieve their user information
            otherwise, create a new player
        */
        socket.on('USER register', function(msg) {

            logger.debug("player joined");

            if (msg.token !== undefined) {

                var existingId = parseInt(msg.token);

                //this user previosuly connected and has an id

                user = users.filter(function(otherUser) {
                    return otherUser.uId === existingId;
                });

                logger.debug("user has joined previously " + user.name + user.uId);

                //check if the user was found
                if (user.length !== 1) {
                    logger.warn("No user found with id, creating new user");
                    user = createNewUser();
                } else {
                    user = user[0];
                }

            } else {
                //first time this user has joined
                user = createNewUser();
                logger.debug("New user, creating new user " + user.name);

            }

            //can't send socket over socket, detach then reattach after sending
            sendUserDetails();

            if (user.roomId !== "") {
                logger.debug("USer " + user.uId + "was in room " + user.roomId + " previously");
                rooms.forEach(function(room) {
                    if (room.id === user.roomId) {
                        putUserInRoom(room.id);
                    }
                });
            }

            logger.debug("Final registered details of user are: ");

        });

        socket.on('USER set name', function(msg) {
            user.name = msg.name;
            logger.debug("User set name as: " + msg.name);
            sendUserDetails();
            putUserInJoining();
        });

        /*
            create room, assign id, add current player and return room id to player
        */
        socket.on('ROOM create', function(msg) {

            roomId = makeid();
            var room = {
                id: roomId,
                usersInRoom: [],
            };

            rooms.push(room);

            putUserInRoom(roomId);
        });

        /*
            Given a user id and a room id,
            check if that room exists, and add the player if they are not already in it
        */
        socket.on('ROOM join', function(msg) {
            putUserInRoom(msg.roomId);
        });


        /*
            Removes a given user from a given room
            The user needs to removed to reference to te room,
            and the server needs to have a reference to the user removed
        */
        socket.on('ROOM leave', function(msg) {

            var roomToLeave = msg.roomId;
            var removed = false;

            //remove user from room
            rooms.forEach(function(room) {

                if (room.id === roomToLeave) {

                    room.usersInRoom = room.usersInRoom.filter(function(userInRoom) {
                        return userInRoom.uId !== user.uId;
                    });

                    broadcastroom(room.id, 'ROOM details', {
                        roomId: room.id,
                        usersInRoom: room.usersInRoom,
                    });
                }
            });

            //remove room from user
            users.forEach(function(otherUser) {
                if (otherUser.uId === user.uId) {
                    otherUser.roomId = "";
                    sendUserDetails();
                }
            });

            socket.emit('ROUTING', {
                location: 'joining'
            });

            logger.debug("Removed user " + user.name + " from room " + roomToLeave);

        });


        /*
            Either Starts the game or moves to the next round

            Called every time a player toggles their ready status
            Called in the room lobby or between rounds

            If everyone in the room has said they are ready, moves to the next gamestage
            toggles the user calls this event either ready or not ready, with a readyToProceedFlag
        */
        socket.on('GAME ready status', function(data) {

            var readyCounter = 0;

            // Get the room
            var room = getRoomFromId(data.roomId);

            // Goes through users in room and toggles their ready status on the server
            room.usersInRoom.forEach(function(iteratedUser) {
                if (iteratedUser.uId === user.uId) {
                    iteratedUser.readyToProceed = (!iteratedUser.readyToProceed);
                }
            });

            // Broadcast the room details so every user can see who is ready and who isn't
            broadcastroom(room.id, 'ROOM details', {
                roomId: room.id,
                usersInRoom: room.usersInRoom,
            });

            // Get number of users ready in room
            room.usersInRoom.forEach(function(iteratedUser) {
                if (iteratedUser.readyToProceed === true) {
                    readyCounter++;
                }
            });

            // Either start a room game or mov to the next round
            // If enough people are ready
            if (readyCounter === room.usersInRoom.length) {

                //after moving players on, set all their ready statuses back to 'not ready'
                room.usersInRoom.forEach(function(iteratedUser) {
                    iteratedUser.readyToProceed = false;
                });

                // if the game hasn't started yet, start the game
                if (room.gameController === undefined) {
                    startGameInRoom(room.id);
                } else {
                    // if the game has already started, move onto the next round
                    startNextRoundInRoom(room.id);
                }
            } else {
                // Not everyone is ready, do nothing
            }
        });

        /*
            Starts a new game for the room

            Creates a gameController for the room, and ititialises it
            Once initalised, starts the first round of the game
        */
        function startGameInRoom(roomId) {

            var room = getRoomFromId(roomId);

            room.gameController = new GameController();

            // Set up the gameController
            // Will start the first round once initialized
            room.gameController.initialize(room.usersInRoom, function(data) {
                startNextRoundInRoom(room.id);
                logger.debug("Starting game in room " + room.id);
            });
        }

        /*
            Starts a new round for players in room
            IF there are more rounds, send the new question out
            If there are no more rounds, game over.
        */
        function startNextRoundInRoom(roomId) {

            var room = getRoomFromId(roomId);

            room.gameController.newRound(function(data) {
                if (data.gameIsOver === true) {

                    // Show the end game page if no rounds left
                    broadcastroom(room.id, 'ROUTING', {
                        location: 'endGame'
                    });

                } else {

                    broadcastroom(room.id, 'ROUTING', {
                        location: 'question'
                    });

                    broadcastroom(room.id, 'GAME question', {
                        question: data.roundQuestion,
                        round: data.round,
                    });

                    //Send each user in the room their individual hand (delt by the GameController)
                    data.players.forEach(function(player) {
                        users.forEach(function(user) {
                            if (player.uId === user.uId) {
                                user.socket.emit('USER hand', {
                                    hand: player.hand
                                });
                            }
                        });
                    });
                }

                logger.info("Starting new round in room " + room.id);

            });
        }

        // submit answer
        socket.on('USER submitChoice', function(msg) {
            /*
             submit answer
            callback will return the answers submitted and if everyone has submitted
             */
            var room;

            socket.emit('ROUTING', {
                location: 'waitQuestion'
            });

            rooms.forEach(function(otherRoom) {
                if (otherRoom.id === msg.roomId) {
                    room = otherRoom;
                }
            });

            room.gameController.submitAnswer(msg.playerId, msg.playerName, msg.answer, function(data) {

                //sends the list of answers each time someone submits one
                broadcastroom(room.id, 'GAME answers', {
                    answers: data.answers
                });

                if (data.allChoicesSubmitted === true) {
                    broadcastroom(room.id, 'ROUTING', {
                        location: 'vote'
                    });
                }
            });
        });

        /*
            submit a vote
            callback will return the results after everyone has voted:
            who submitted what answer, who voted for them, their score after the round
        */
        socket.on('USER vote', function(msg) {
            var room;

            socket.emit('ROUTING', {
                location: 'waitVote'
            });

            rooms.forEach(function(otherRoom) {
                if (otherRoom.id === msg.roomId) {
                    room = otherRoom;
                }
            });

            // Submits the vote information to the game controller
            // If all votes are submitted, move user to results page
            // Otherwise they just get the current round results
            room.gameController.submitVote(msg.playerId, msg.answer, function(data) {

                //send room the vote data after each vote
                broadcastroom(room.id, 'GAME playerRoundResults', {
                    results: data.res,
                    voteNumber: data.voteNumber
                });


                if (data.allVotesSubmitted === true) {
                    //moving all players to the results page
                    broadcastroom(room.id, 'ROUTING', {
                        location: 'results'
                    });

                }

            });
        });

        /*
            When a client disconnect, we remove him from the room he was in
            the user still remembers what room his was in however,
            so that he can join again
        */
        socket.on('disconnect', function() {
            logger.debug("Disconnecting player " + user.name);

            rooms.forEach(function(room) {

                if (room.id === user.roomId) {

                    room.usersInRoom = room.usersInRoom.filter(function(usersInRoom) {
                        return usersInRoom.uId !== user.uId;
                    });

                    broadcastroom(room.id, 'ROOM details', {
                        roomId: room.id,
                        usersInRoom: room.usersInRoom,
                    });

                    logger.debug("Removing player from room" + room.id);
                }
            });
        });

        /*
            Puts a user into a room
            Tells the user and the room that a change has occured
            Tells the routing service to move to the room page
            Tell all other users in the room that a player has joined
            Does not put the user in if they are already put in it
        */
        function putUserInRoom(roomId) {

            logger.debug("trying to put user in room " + user.name + user.uId);

            var roomFound = false;
            var joined = false;
            var userAlreadyInRoom = false;
            var gameInProgress = true;

            var errorText = "room does not exist";

            room = getRoomFromId(roomId);

            if (room !== undefined) {

                roomFound = true;

                // Only join the room if user not already in ANY room
                // Handles user pressing join room multiple times
                room.usersInRoom.forEach(function(userInRoom) {
                    if (userInRoom.uId === user.uId) {
                        //USER IS ALREADY IN THIS ROOM, THEY CANNOT JOIN
                        userAlreadyInRoom = true;
                        errorText = "already in room";
                    }
                });

                // Check if room has a game in proress
                if (room.gameController === undefined) {
                    gameInProgress = false;
                }

                // Actaully put the user in the room
                if (userAlreadyInRoom === false && gameInProgress === false) {

                    // Add the user to the room
                    room.usersInRoom.push({
                        uId: user.uId,
                        username: user.name,
                        readyToProceed: false
                    });

                    user.roomId = roomId;

                    // Tell the user they have joined
                    socket.emit('USER room join', {
                        success: true,
                        roomId: room.id
                    });

                    // Route them to the room lobby
                    socket.emit('ROUTING', {
                        location: 'room'
                    });

                    //Update the room serveice of every user
                    broadcastroom(room.id, 'ROOM details', {
                        roomId: room.id,
                        usersInRoom: room.usersInRoom,
                    });

                    logger.debug("User " + user.name + " joined room " + roomId);

                    joined = true;
                }
            }

            if (!roomFound) {
                errorText = "code \"" + roomId + "\" does not match any existing room";
            } else if (gameInProgress) {
                errorText = "the game is already in progress";
            } else if (userAlreadyInRoom) {
                errorText = "you are already in that room!";
            }

            if (joined) {
                logger.info("User " + user.name + " joined room " + roomId);
            } else {
                socket.emit("ERROR message", {
                    errorText: "Cannot join the room, " + errorText
                });
                logger.warn("User " + user.name + " could not join room " + roomId);
            }
        }

        function sendUserDetails() {
            user.socket = "";
            socket.emit('USER details', {
                user: user
            });
            user.socket = socket;
        }

        function putUserInJoining() {
            socket.emit('ROUTING', {
                location: 'joining'
            });
        }

        /*
            Given a room ID finds the room in the rooms list
        */
        function getRoomFromId(roomId) {
            var room;
            rooms.forEach(function(otherRoom) {
                if (otherRoom.id === roomId) {
                    room = otherRoom;
                }
            });
            if (room === undefined) {
                logger.error("Cannot find room " + roomId);
            }
            return room;
        }

        //Creates a new user
        function createNewUser() {
            var user = {};
            user.uId = uId;
            user.name = undefined;
            user.roomId = "";
            user.socket = socket;
            users.push(user);
            uId++;
            return user;
        }

    });

    /*
        emit event and data to all players in a certain room
        that is passed as an argument
        -> used to send a new join and new leave event
        with the data as the new list of players in the room
    */
    function broadcastroom(room, event, data) {
        users.forEach(function(user) {
            if (user.roomId === room) {
                user.socket.emit(event, data);
            }
        });
    }

    /*
        make an id for 5 letters until it is unique
        used in create room
    */
    function makeid() {
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var used = true;
        var text;
        var CODELENGTH = 4;

        while (used === true) {
            text = "";
            used = false;
            for (var i = 0; i < CODELENGTH; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            used = checkId(text);
        }
        return text;
    }

    //check if there is a room with a certain id
    //that is passed as an argument and
    //return true or false accordingly
    function checkId(text) {
        rooms.forEach(function(room) {
            if (room.id === text) {
                return true;
            }
        });
        return false;
    }

    server.listen(port, function() {
        var addr = server.address();

        logger.info("Chat server listening at port: " + addr.port);

    });

    return server;
};
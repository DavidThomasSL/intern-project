var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var log4js = require('log4js');

var logger = log4js.getLogger();

var GameController = require('./GameController');
var User = require('./User');
var Room = require('./Room');

module.exports = function(port, enableLogging, testing) {
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

            If they are in a room, they will be put back in,
            if the game is in progress in the room, that will rejoin at the current game stage
        */
        socket.on('USER register', function(msg) {

            logger.debug("player joined");

            if (msg.token !== undefined) {

                //Get the id he user has in their session storage
                user = getUserFromId(msg.token);

                logger.debug("user has joined previously ");


                //check if the user was found
                if (user !== undefined) {
                    //give the user the socket they've connected with
                    user.socket = socket;
                    logger.debug("Found previous user ");
                } else {
                    logger.warn("No user found with id, creating new user");
                    user = createNewUser();
                }

            } else {
                //first time this user has joined
                user = createNewUser();

                logger.debug("New user, creating new user " + user.uId);
            }

            //Send the client the user details
            user.sendUserDetails();
            user.emit("GAME rooms available", getRoomsInformation());

            // Check if the user was in a room
            // If the room has a game in progress, they will re-join that game
            if (user.roomId !== "") {
                logger.debug("User " + user.uId + "was in room " + user.roomId + " previously");
                putUserInRoom(user.roomId);
            } else if (user.name !== undefined) {
                logger.debug("Putting user in joining");
                putUserInJoining();
            } else {
                logger.debug("Putting user in set name");
                putUserInSetName();
            }

            logger.debug("Final registered details of user are: " + user.name + " " + user.uId);
        });

        socket.on('USER set profile', function(data) {
            user.name = data.name;
            user.image = data.image;
            user.isObserver = data.isObserver;
            user.readyToProceed = data.isObserver;
            user.sendUserDetails();

            putUserInJoining();

            logger.debug("User set name as: " + data.name);
        });
        /*
            create room, assign id, add current player and return room id to player
        */
        socket.on('ROOM create', function(msg) {

            roomId = makeid();

            var room = new Room(roomId);
            rooms.push(room);

            users.forEach(function(user) {
                user.emit("GAME rooms available", getRoomsInformation());
            });

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
            Create a new room and put the calling user into it
            Send a message to all other users in the old room to ask if they want to join
        */
        socket.on('GAME play again', function(msg) {
            var oldRoom = getRoomFromId(msg.oldRoomId);
            var user = getUserFromId(msg.userId);
            var newRoomId = user.roomId;


            oldRoom.removeUser(user);

            oldRoom.broadcastRoom('USER play again', {
                newRoomId: newRoomId,
                user: user.name
            });

            oldRoom.broadcastRoom("NOTIFICATION actionable", {
                action: 'play again',
                newRoomId: newRoomId,
                user: user.name
            });

        });

        /*
            send message in room loby
            and broadcast that message to everyone in the room
        */
        socket.on('USER send message', function(msg) {

            var room = getRoomFromId(msg.roomId);

            if (room.submitMessage(msg) === true)
                room.broadcastRoom('ROOM messages');
        });

        /*
            Removes a given user from a given room
            The user needs to removed to reference to te room,
            and the server needs to have a reference to the user removed
        */
        socket.on('ROOM leave', function(msg) {

            var room = getRoomFromId(msg.roomId);

            if (room !== undefined) {
                room.removeUser(user);
                room.broadcastRoom('ROOM details');
            }

            if (!user.isObserver) {
                user.readyToProceed = false;
            }

            user.roomId = "";
            user.sendUserDetails();

            putUserInJoining();

            logger.debug("Removed user " + user.name + " from room " + room.id);
        });

        /*
            Set by the players in the room lobby if they want to
                enable bots during the game or not (and how many)
                number of rounds to be played

        */
        socket.on('ROOM setGameParameters', function(data) {
            var room = getRoomFromId(data.roomId);

            // add the required number of bots to the room
            room.setBotNumber(data.botNumber);
            // set them  number of rounds
            // room.botNumber = data.botNumber;
            room.numRounds = data.numRounds;

            // send details back to all clients in the room
            room.broadcastRoom("ROOM details");
            return;
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
            room.broadcastRoom("ROOM details");

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
                    if (!iteratedUser.isObserver) {
                        iteratedUser.readyToProceed = false;
                    }
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

        socket.on('GAME replace cards', function(data) {
            var room = getRoomFromId(user.roomId);

            room.gameController.replaceHand(user.uId, data.cardsToReplace, function(newHand, newResults) {
                user.emit('USER hand', {
                    hand: newHand
                });
                room.broadcastRoom('GAME playerRoundResults', {
                    results: newResults,
                    voteNumber: 0
                });
                user.emit("NOTIFICATION message", {
                    text: "Replaced hand",
                    type: "success"
                });
            });
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
            room.gameController.initialize(room, function() {
                startNextRoundInRoom(room.id);
                logger.debug("Starting game in room " + room.id);
            });
        }

        function getRoomsInformation() {

            var roomsAvailable = [];
            rooms.forEach(function(room) {

                var roomDet = {
                    id: room.id
                };
                roomsAvailable.push(roomDet);
            });
            return roomsAvailable;
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

                    room.broadcastRoom("ROUTING", {
                        location: 'endGame'
                    });

                } else {

                    room.broadcastRoom("ROUTING", {
                        location: 'question'
                    });

                    room.broadcastRoom("GAME question", {
                        question: data.roundQuestion,
                        round: data.round,
                        maxRounds: data.maxRounds,
                        handReplaceCost: data.handReplaceCost
                    });
                    room.broadcastRoom('ROOM details');

                    //Send each user in the room their individual hand (delt by the GameController)
                    data.players.forEach(function(player) {
                        users.forEach(function(user) {
                            if (player.uId === user.uId) {
                                user.emit('USER hand', {
                                    hand: player.hand
                                });
                            }
                        });
                    });

                    // once a new round has started (aka we are on question page)
                    // start a timer
                    // and wait until it has ran out (triggers a callback)
                    room.gameController.startTimer(function(data) {

                        // time has ran out so everyone is routed to the voting page
                        room.broadcastRoom("ROUTING", {
                            location: 'vote'
                        });

                        // start new timer for the voting page
                        // and wait until time rans out
                        room.gameController.startTimer(function(data) {

                            //time has ran out so everyone is routed to the results page
                            room.broadcastRoom("ROUTING", {
                                location: 'results'
                            });


                            room.broadcastRoom("GAME playerRoundResults", {
                                results: data.results,
                                voteCounter: data.voteCounter
                            });
                        });
                    });
                }

                logger.debug("Starting new round in room " + room.id);
            });
        }

        // submit answer
        socket.on('USER submitChoice', function(msg) {

            var room = getRoomFromId(user.roomId);

            socket.emit('ROUTING', {
                location: 'waitQuestion'
            });

            // submit answer
            // callback will return the answers submitted and if everyone has submitted
            room.gameController.submitAnswer(user.uId, msg.answer, function(data) {

                //sends the list of answers each time someone submits one
                room.broadcastRoom("GAME answers", {
                    answers: data.answers
                });

                if (testing !== undefined) {
                    room.broadcastRoom("GAME timeout", {
                        timeout: 0
                    });
                }

                //immediately updates the hand of the player who submitted the answer
                user.emit('USER hand', {
                    hand: data.submittingPlayersNewHand
                });

                // once everyone submitted an answer
                if (data.allChoicesSubmitted === true) {

                    room.broadcastRoom("ROUTING", {
                        location: 'vote'
                    });

                    // start a timer for the voting page
                    room.gameController.startTimer(function(data) {

                        // once the time has ran out route everyone to the results page
                        room.broadcastRoom("ROUTING", {
                            location: 'results'
                        });
                        room.broadcastRoom("GAME playerRoundResults", {
                            results: data.results,
                            voteCounter: data.voteCounter
                        });
                    });
                }
            });
        });

        /*
            Submit a vote
            callback will return the results after everyone has voted:
            who submitted what answer, who voted for them, their score after the round
        */
        socket.on('USER vote', function(msg) {

            var room = getRoomFromId(user.roomId);

            socket.emit('ROUTING', {
                location: 'waitVote'
            });

            // Submits the vote information to the game controller
            // If all votes are submitted, move user to results page
            // Otherwise they just get the current round results
            room.gameController.submitVote(user.uId, msg.answer, function(data) {

                // Send room the vote data after each vote
                room.broadcastRoom("GAME playerRoundResults", {
                    results: data.res,
                    currentVotes: data.currentVotes,
                    voteNumber: data.voteNumber
                });

                if (data.allVotesSubmitted === true) {
                    // Moving all players to the results page
                    room.broadcastRoom("ROUTING", {
                        location: 'results'
                    });
                }
            });
        });

        /*
            When a client disconnect, we remove him from the room he was in
            the user still remembers what room his was in however,
            so that he can join again

            Takes the user out of the game if they were in one
        */
        socket.on('disconnect', function() {

            room = getRoomFromId(user.roomId);

            if (room !== undefined) {
                // Take the user out of the game (set as disconnected)
                room.removeUser(user);

                if (!user.isObserver) {
                    user.readyToProceed = false;
                }

                logger.debug("Removing player from room" + room.id);
            } else {
                logger.debug("User was not in a room");
            }

            logger.debug("User disconnected " + user.name);
        });

        /*
            Puts a user into a room
            Tells the user and the room that a change has occured
            Tells the routing service to move to the room page
            Tell all other users in the room that a player has joined
            Does not put the user in if they are already put in it
        */
        function putUserInRoom(roomId) {

            var result = {};
            var errorText = "";
            var room = getRoomFromId(roomId.toUpperCase()); // accept lowercase spelling of room code

            logger.debug("trying to put user in room " + user.name + user.uId);

            // Try and put the user in the room, and deal with the result if there is an error
            if (room !== undefined) {

                // Try and join the room
                result = room.addUser(user, testing);

                if (result.gameInProgress) {
                    errorText = "the game is already in progress";
                } else if (result.userAlreadyInRoom) {
                    errorText = "you are already in that room!";
                }

            } else {
                // No room was found
                errorText = "code \"" + roomId + "\" does not match any existing room";
                result.joined = false;
            }

            if (result.joined) {
                room.broadcastRoom('ROOM messages');
                logger.debug("User " + user.name + " joined room " + roomId);
            } else {
                socket.emit("NOTIFICATION message", {
                    text: "Cannot join the room, " + errorText,
                    type: "error"
                });
                logger.warn("User " + user.name + " could not join room " + roomId);
            }
        }

        function putUserInJoining() {
            socket.emit("ROUTING", {
                location: 'joining'
            });
        }

        function putUserInSetName() {
            socket.emit("ROUTING", {
                location: '/'
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
                logger.debug("Cannot find room " + roomId);
            }
            return room;
        }

        function getUserFromId(existingId) {
            var foundUser;

            users.forEach(function(otherUser) {
                if (otherUser.uId === existingId) {
                    foundUser = otherUser;
                }
            });

            return foundUser;
        }

        //Creates a new user object
        function createNewUser() {
            var user = new User(socket);
            users.push(user);
            return user;
        }
    });

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

        logger.debug("Chat server listening at port: " + addr.port);

    });

    return server;
};

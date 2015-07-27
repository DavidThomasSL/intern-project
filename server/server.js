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
                logger.debug("user has joined previously");

                user = users.filter(function(otherUser) {
                    return otherUser.uId === existingId;
                });

                //check if the user was founds
                if (user.length !== 1) {
                    logger.warn("No user found with id, creating new user");
                    user = createNewUser();
                } else {
                    user = user[0];
                }

            } else {
                //first time this user has joined
                logger.debug("New user, creating new user");
                user = createNewUser();
            }

            //can't send socket over socket, detach then reattach after sending
            sendUserDetails();

            if (user.roomId !== "") {
                rooms.forEach(function(room) {
                    if (room.id === user.roomId) {
                        putUserInRoom(room.id);
                    }
                });
            }

        });

        socket.on('USER set name', function(msg) {
            user.name = msg.name;
            logger.debug("User set name as: " + msg.name);
            sendUserDetails();
            putUserInJoining();
        });

        //create room, assign id, add current player and return room id to player
        socket.on('ROOM create', function(msg) {

            roomId = makeid();
            var room = {
                id: roomId,
                usersInRoom: [],
                gameInProgress: false
            };

            rooms.push(room);

            putUserInRoom(roomId);
        });

        /*
            Given a user id and a room id,
            check if that room exisits, and add the player if they are not already in it
        */
        socket.on('ROOM join', function(msg) {
            rooms.forEach(function(room) {
                if (room.id === msg.roomId) {
                    if(room.gameInProgress === false){
                        putUserInRoom(msg.roomId);
                    }
                }
            });
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
                        gameInProgress: room.gameInProgress
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

            logger.debug("Removed user " + user.uId + " from room " + roomToLeave);

        });

        /*
            Called by the GameService
            Creates a new gamecontroller, adds the current room to it
            gamecontroller starts whirring
        */
        socket.on('GAME start', function(data) {
            var room;


            rooms.forEach(function(otherRoom) {
                if (otherRoom.id === data.roomId) {
                    room = otherRoom;
                }
            });

            room.gameController = new GameController();
            room.gameInProgress = true;

            room.gameController.initialize(room.usersInRoom, function(data) {

                broadcastroom(room.id, 'ROUTING', {
                    location: 'question'
                });
                broadcastroom(room.id, 'GAME question', {
                    question: data.roundQuestion,
                    round: data.round
                });
                broadcastroom(room.id, 'ROOM details', {
                    roomId: room.id,
                    usersInRoom: room.usersInRoom,
                    gameInProgress: room.gameInProgress
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

            });

            logger.debug("Starting game in room " + room.id);
        });

        /*
        Starts new round:
        call function in gameController to start new round
        callback will return a new question which will be broadcasted to eveyone in the game
        each player will be send his updated hand
        */
        socket.on('GAME next round', function(data) {
            var room;


            rooms.forEach(function(otherRoom) {
                if (otherRoom.id === data.roomId) {
                    room = otherRoom;
                }
            });

            room.gameController.newRound(function(data) {

                broadcastroom(room.id, 'ROUTING', {
                    location: 'question'
                });

                broadcastroom(room.id, 'GAME question', {
                    question: data.roundQuestion,
                    round: data.round
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

            });

            logger.info("Starting new round in room " + room.id);
        });

        /*
        call function in gameController to finish the game
        callback will return the final scores (as data.res)
        */
        socket.on('GAME finish', function(data) {
            var room;

            rooms.forEach(function(otherRoom) {
                if (otherRoom.id === data.roomId) {
                    room = otherRoom;
                }
            });

            room.gameController.finishGame(function(data) {

                broadcastroom(room.id, 'ROUTING', {
                    location: 'endGame'
                });

                broadcastroom(room.id, 'GAME finish', {
                    results: data.res
                });

            });

            logger.info("Finishing game in room " + room.id);
        });

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

        //When a client disconnect, we remove him from the room he was in
        //the user still remembers what room his was in however,
        //so that he can join again
        socket.on('disconnect', function() {
            logger.debug("Disconnecting player");

            rooms.forEach(function(room) {

                if (room.id === user.roomId) {

                    room.usersInRoom = room.usersInRoom.filter(function(usersInRoom) {
                        return usersInRoom.uId !== user.uId;
                    });

                    broadcastroom(room.id, 'ROOM details', {
                        roomId: room.id,
                        usersInRoom: room.usersInRoom,
                        gameInProgress: room.gameInProgress
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
        */
        function putUserInRoom(roomId) {
            logger.debug("putting user in room");
            var joined = false;

            rooms.forEach(function(room) {
                if (room.id === roomId) {

                    room.usersInRoom.push({
                        uId: user.uId,
                        username: user.name
                    });

                    user.roomId = roomId;

                    socket.emit('USER room join', {
                        success: true,
                        roomId: room.id
                    });

                    socket.emit('ROUTING', {
                        location: 'room'
                    });

                    //Update the room serveice of every user
                    broadcastroom(room.id, 'ROOM details', {
                        roomId: room.id,
                        usersInRoom: room.usersInRoom,
                        gameInProgress: room.gameInProgress
                    });

                    logger.debug("User " + user.uId + " joined room " + roomId);

                    joined = true;

                }
            });
        }

        function sendUserDetails() {
            user.socket = "";
            socket.emit('USER details', {
                user: user
            });
            user.socket = socket;

        }

        function sendGameDetails(gameController) {
            socket.emit('GAME details', gameController.getGameDetails());
        }

        function putUserInJoining() {
            socket.emit('ROUTING', {
                location: 'joining'
            });
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
        Sends to every user in a room a list of submitted answers to a question
        excluding the answer that the user themselves submitting
        preventing them from voting for them selves
    */
    function broadcastoptions(room, event, data) {
        users.forEach(function(user) {
            var toSend = [];
            if (user.roomId === room) {
                data.answers.forEach(function(ans) {
                    if (ans.playerId !== user.uId) {
                        var field = {
                            ans: ans.answerText
                        };
                        toSend.push(field);
                    }
                });
                user.socket.emit(event, toSend);
            }
        });
    }

    //make an id for 5 letters until it is unique
    //used in create room
    function makeid() {
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var used = true;
        var text;
        while (used === true) {
            text = "";
            used = false;
            for (var i = 0; i < 5; i++) {
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
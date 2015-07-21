var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var log4js = require('log4js');

var logger = log4js.getLogger();



module.exports = function(port, enableLogging) {
    var router = express();
    var server = http.createServer(router);
    var io = socketio.listen(server, {
        log: enableLogging
    });

    io.set('log level', 1);
    logger.setLevel('DEBUG');


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

            logger.info("player joined");

            if (msg.token !== undefined) {

                var existingId = parseInt(msg.token);

                //this user previosuly connected and has an id
                logger.info("user has joined previously");
                logger.debug(users);

                user = users.filter(function(otherUser) {
                    return otherUser.uId === existingId;
                });

                //check if the user was founds
                if (user.length !== 1) {
                    logger.warn("No user found with id, creating new user");
                    user = createNewUser();
                } else {
                    logger.debug(user);
                    user = user[0];
                }

            } else {
                //first time this user has joined
                logger.info("New user, creating new user");
                user = createNewUser();
            }
            // console.log(user);
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
            logger.info("User set name as: " + msg.name);
            sendUserDetails();
            putUserInJoining();
        });

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

        //create room, assign id, add current player and return room id to player
        socket.on('ROOM create', function(msg) {

            roomId = makeid();
            var room = {
                id: roomId,
                usersInRoom: []
            };

            rooms.push(room);

            putUserInRoom(roomId);
        });


        /*
            Given a user id and a room id,
            check if that room exisits, and add the player if they are not already in it
        */
        socket.on('ROOM join', function(msg) {
            putUserInRoom(msg.roomId);
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
                        usersInRoom: room.usersInRoom
                    });

                    logger.info("User " + user.uId + " joined room " + roomId);

                    joined = true;

                }
            });

            if(!joined) {logger.error("User cannot join room " + roomId);}
        }


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
                        usersInRoom: room.usersInRoom
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

            logger.info("Removed user " + user.uId + " from room " + roomToLeave);

        });

        //When a client disconnect, we remove him from the room he was in
        //the user still remembers what room his was in however,
        //so that he can join again
        socket.on('disconnect', function() {
            logger.info("Disconnecting player");

            rooms.forEach(function(room) {

                if (room.id === user.roomId) {

                    room.usersInRoom = room.usersInRoom.filter(function(usersInRoom) {
                        return usersInRoom.uId !== user.uId;
                    });

                    broadcastroom(room.id, 'ROOM details', {
                        roomId: room.id,
                        usersInRoom: room.usersInRoom
                    });

                    logger.info("Removing player from room" + room.id);
                }
            });
        });

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

    // emit event and data to all players in a certain room
    // that is passed as an argument
    // -> used to send a new join and new leave event
    // with the data as the new list of players in the room
    function broadcastroom(room, event, data) {
        users.forEach(function(user) {
            if (user.roomId === room) {
                console.log("found user in room");
                console.log(user);
                user.socket.emit(event, data);
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
        if (enableLogging) {
            logger.info("Chat server listening at port: " + addr.port);
        }
    });

    return server;
};
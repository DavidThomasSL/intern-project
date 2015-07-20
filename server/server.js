var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');


module.exports = function(port, enableLogging) {
    var router = express();
    var server = http.createServer(router);
    var io = socketio.listen(server, {
        log: enableLogging
    });

    io.set('log level', 1);

    router.use(express.static(path.resolve(__dirname, '../client')));

    var rooms = [];
    var messages = [];
    var users = [];
    var uId = 0;
    var roomId = 0;

    io.on('connection', function(socket) {
        //create a new user for the connection
        var user = {};
        user.socket = socket;

        /*  client requests to join,
            send the uId to the player
            if the player already has a session token,
            they will respond that they have an id,
            and we retrieve their user information
            otherwise, create a new player
        */
        socket.on('join', function(msg) {
            console.log("player joined");
            if (msg.token !== undefined) {
                console.log("exsitng player");
                //this user previosuly connected and has an id

                var existingId = parseInt(msg.token);

                console.log("exisitng users");
                console.log(users);

                user = users.filter(function(otherUser) {
                    return otherUser.uId === existingId;
                });

                //check if the user was founds
                if (user.length !== 1) {
                    console.log("No user found with id");
                    user = createNewUser();

                } else {
                    console.log(user);
                    user = user[0];
                }

            } else {
                //first time this user has joined
                console.log("new user");
                user = createNewUser();

            }

            //can't send socket over socket, detach then reattach after sending
            user.socket = "";
            socket.emit('user details', {
                user: user
            });
            user.socket = socket;

        });

        socket.on('set name', function(msg, callback) {
            user.name = msg.name;
            console.log(msg.name);

            callback();
        });

        //create room, assign id, add current player and return room id to player
        socket.on('create room', function(msg, callback) {

            roomId = makeid();
            var room = {
                id: roomId,
                players: [msg.playerId]
            };

            user.roomId = roomId;
            rooms.push(room);

            console.log(rooms);
              //roomId++;

            // socket.emit('room join result', {success: true, roomId: room.id, usersInRoom: room.players});
            callback({
                success: true,
                roomId: room.id,
                usersInRoom: room.players
            });
        });

        /*
            Given a user id and a room id,
            check if that room exisits, and add the player if they are not already in it
            if the room does not exist, send an error back to the player
            return wether the join was successful or not
        */
        socket.on('join room', function(msg, callback) {

            var toJoinId = msg.roomId;
            var userId = parseInt(msg.uId);
            var joined = false;
            var joinedRoom = {};

            //get the room
            rooms.forEach(function(room) {
                //add player to room
                if (room.id === toJoinId) {
                    room.players.push(msg.playerId);
                    user.roomId = toJoinId;
                    joinedRoom = room;
                    joined = true;

                    broadcastroom(toJoinId, 'new join', joinedRoom.players);
                }
            });

            if (joined) { console.log("joined successfully"); }
            else { console.log("failed to join room"); }


            // socket.emit('room join result', {success: joined, roomId: toJoinId, usersInRoom: joinedRoom.players});
            callback({
                success: joined,
                roomId: toJoinId,
                usersInRoom: joinedRoom.players
            });

            console.log(rooms);
        });


        /*
            Removes a given user from a given room
            The user needs to removed to reference to te room,
            and the server needs to have a reference to the user removed
        */
        socket.on('leave room', function(msg, callback) {

            var userToLeaveId = parseInt(msg.userId);
            var roomToLeave = msg.roomId;
            var removed = false;

            console.log("In leave room");

            //remove user from room
            rooms.forEach(function(room) {

                if (room.id === roomToLeave) {

                    if (room.players.indexOf(userToLeaveId) > -1) {

                        room.players = room.players.filter(function(playerId) {
                            return playerId !== userToLeaveId;
                        });

                        removed = true;

                        broadcastroom(roomToLeave, 'new leave', room.players);
                    }
                }
            });

            //remove room from user
            users.forEach(function(otherUser) {

                if (otherUser.uId === userToLeaveId) {
                    otherUser.roomId = undefined;
                }
            });

            if (removed) {
                console.log("Removed user " + userToLeaveId + " from room " + roomToLeave);
            } else {
                console.log("ERROR: USER WAS NOT IN ROOM");
            }

            callback(removed);
        });

        socket.on('get username', function(msg, callback) {

            var userToReturn = [];

            userToReturn = users.filter(function(user) {
                return user.uId === parseInt(msg.uId);
            });

            userToReturn = userToReturn[0].name;
            // console.log("get a username" + msg.uId);
            // console.log(userToReturn);
            callback(userToReturn);
        });

        //When a client disconnect, we remove him from the room he was in
        //the user still remembers what room his was in however,
        //so that he can join again
        socket.on('disconnect', function() {
            console.log("Disconnecting player");

            rooms.forEach( function(room){
                if (room.id === user.roomId) {
                    room.players = room.players.filter(function(usersInRoom) {
                        return usersInRoom !== user.uId;
                    });

                }
            });
        });

        socket.on('get room users', function(msg, callback) {

            var roomToReturn = [];
            var usersInRoom = [];

            roomToReturn = rooms.filter(function(room) {
                if (room.id === msg.roomId) {
                    return room;
                }
            });

            roomToReturn = roomToReturn[0];

            users.forEach(function(user) {
                if (user.roomId == roomToReturn.id) {
                    usersInRoom.push(user.name);
                }
            });

            console.log(usersInRoom);

            callback(usersInRoom);
        });

        //Creates a new user
        function createNewUser() {
            var user = {};
            user.uId = uId;
            user.name = undefined;
            user.roomId = -1;
            users.push(user);
            uId++;
            return user;
        }

    });

    function broadcast(event, data) {
        users.forEach(function(user) {
            user.socket.emit(event, data);
        });
    }

     function broadcastroom(room, event, data) {

        users.forEach(function(user) {
            if (user.roomId === room ) {
                console.log("found user in room");
                user.socket.emit(event, data);
            }
        });
    }

    //make an id for 5 letters until it is unique
    function makeid() {
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var used = true;
        var text;
        while ( used === true ) {
            text = "";
            used = false ;
            for( var i=0; i < 5; i++ ) {
                text += possible.charAt(Math.floor(Math.random() * possible.length)); }
            used = checkId(text);
        }
        return text;
    }

    function checkId (text) {
        rooms.forEach(function(room) {
            if ( room.id === text ) { return true; }
        });
        return false;
    }

    server.listen(port, function() {
        var addr = server.address();
        if (enableLogging) {
            console.log("Chat server listening at port: " + addr.port);
        }
    });

    return server;
};

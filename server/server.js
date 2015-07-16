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

        console.log(users);

        /*  client requests to join,
            send the uId to the player
            if the player already has a session token,
            they will respond that they have an id,
            and we retrieve their user information
            otherwise, create a new player
        */
        socket.on('join', function(msg) {
            if (msg.token !== undefined) {
                console.log("exsitng player")
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

        socket.on('set name', function(msg) {
            user.name = msg.name;
            console.log(msg.name);
        });

        //create room, assign id, add current player and return room id to player
        socket.on('create room', function(msg, callback) {

            var room = {
                id: roomId,
                players: [msg.playerId]
            };

            user.roomId = roomId;
            rooms.push(room);
            // console.log(rooms);
            roomId++;

            // socket.emit('room join result', {success: true, roomId: room.id, usersInRoom: room.players});
            callback({success: true, roomId: room.id, usersInRoom: room.players});
        });

        /*
            Given a user id and a room id,
            check if that room exisits, and add the player if they are not already in it
            if the room does not exist, send an error back to the player
            return wether the join was successful or not
        */
        socket.on('join room', function(msg, callback) {

            var toJoinId = parseInt(msg.roomId);
            var userId = parseInt(msg.uId);
            var joined = false;
            var joinedRoom = {};

            //get the room
            rooms.forEach(function (room){

                if(room.id === toJoinId){


                    console.log("Found room " + toJoinId);

                    //add player to room
                    room.players.push(msg.playerId);
                    user.roomId = toJoinId;
                    joinedRoom = room;

                    joined = true;
                }
            });

            if(joined) {console.log("joined successfully");}
            else {console.log("failed to join room");}

            // socket.emit('room join result', {success: joined, roomId: toJoinId, usersInRoom: joinedRoom.players});
            callback({success: joined, roomId: toJoinId, usersInRoom: joinedRoom.players});

            console.log(rooms);
        });

        //send all previosu messages to the new user
        messages.forEach(function(data) {
            socket.emit('message', data);
        });

        socket.on('get username', function(msg, callback) {

            var  userToReturn = [];

            userToReturn = users.filter(function(user){
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
            console.log(rooms);
            rooms.forEach( function(room){
                if (room.id === user.roomId) {

                    room.players = room.players.filter(function(usersInRoom) {
                        return usersInRoom !== user.uId;
                    });

                };

            });
            console.log(rooms);

        });

        socket.on('get room users', function(msg, callback) {

            var roomToReturn = [];
            var usersInRoom = [];

            roomToReturn = rooms.filter(function(room) {
                if( room.id === parseInt(msg.roomId)) {
                    return room;
                }
            });

            roomToReturn = roomToReturn[0];

            users.forEach( function(user) {
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
            user.roomId = undefined;
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

    server.listen(port, function() {
        var addr = server.address();
        if (enableLogging) {
            console.log("Chat server listening at port: " + addr.port);
        }
    });

    return server;
};
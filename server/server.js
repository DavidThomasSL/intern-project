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

                user = users.filter(function(otherUser) {
                    return otherUser.uId === existingId;
                });

                //check if the user was found
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

            users.push(user);

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
        socket.on('create room', function(msg) {
            var room = {
                id: roomId,
                players: [msg.playerId]
            };
            rooms.push(room);
            console.log(rooms);
            roomId++;
            socket.emit('room created', {roomId: room.id});
            // return room.id;
        });

        /*
            Given a user id and a room id,
            check if that room exisits, and add the player if they are not already in it
            if the room does not exist, send an error back to the player
            return wether the join was successful or not
        */
        socket.on('join room', function(msg) {

            var roomToJoin = parseInt(msg.roomId);
            var userId = parseInt(msg.uId);
            var joined = false;

            //get the room
            rooms.forEach(function (room){

                if(room.id === roomToJoin){

                    console.log("Found room " + roomToJoin);

                    //add player to room
                    room.players.push(msg.playerId);
                    joined = true;
                }
            });

            if(joined) {console.log("joined successfully");}
            else {console.log("failed to join room");}

            socket.emit('room join result', {success: joined, roomId: roomToJoin});

            console.log(rooms);
        });

        //send all previosu messages to the new user
        messages.forEach(function(data) {
            socket.emit('message', data);
        });



        socket.on('disconnect', function() {
            // users = users.filter(function(user) {
            //     return user.socket !== socket;
            // });
        });

        //Creates a new user
        function createNewUser() {
            var user = {};
            user.uId = uId;
            user.name = undefined;
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
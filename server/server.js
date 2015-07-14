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
                console.log("existing id" + existingId);
                user = users.filter(function(otherUser) {
                    return otherUser.uId === existingId;
                });

                user = user[0];

                if (user === undefined) {
                    console.log("SHIIITTT");
                } else {
                    console.log(user);
                }
                //TODO ERROR CHECK IF NOT FOUND< OR TWO USERS RETURNED
            } else {
                //first time this user has joined
                user.uId = uId;
                users.push(user);
                uId++;
            }

            user.socket = "";
            console.log("emtting to user details");
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

        socket.on('join room', function(msg) {
            rooms.forEach(function (room){
                if(parseInt(room.id) === parseInt(msg.roomId)){
                    console.log(msg.roomId)
                    var found = false;
                    room.players.forEach( function(player) {
                        if ( parseInt(player) === parseInt(msg.playerId))
                            found = true;
                    });
                    if (found === false) {
                    room.players.push(msg.playerId);
                }
                    socket.emit('room joined', {roomId: room.id});
                }
                    //socket.emit('failed room join');
            });

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
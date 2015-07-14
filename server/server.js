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

  var messages = [];
  var users = [];
  var uId = 0;

  io.on('connection', function (socket) {

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
            if(msg.token !== undefined) {
                console.log("exsitng player")
                //this user previosuly connected and has an id
                var existingId = msg.token.id;
                user = users.filter( function(otherUser) {
                    return otherUser.uId = existingId;
                });

                //TODO ERROR CHECK IF NOT FOUND< OR TWO USERS RETURNED
            }
            else {
                //first time this user has joined
                user.uId = uId;
                users.push(user);
                uId++;
                socket.emit('allocate id', {uId: user.uId});
            }
        });


        //send all previosu messages to the new user
        messages.forEach(function (data) {
            socket.emit('message', data);
        });


        socket.emit('join', function() {

        });

        socket.on('disconnect', function () {
            users = users.filter( function(user) {
                return user.socket !== socket;
            });
        });


        socket.on('message', function (msg) {
            // var text = String(msg || '');
            var sendingText = msg.text;
            var sendingId = msg.id;

            // if (!text)
            //     return;

            var toSend = {text: sendingText, id: sendingId};
            console.log(toSend)

            broadcast('message', toSend);
            messages.push(toSend);

        });
    });

  function broadcast(event, data) {
    users.forEach(function (user) {
      user.socket.emit(event, data);
    });

    function broadcast(event, data) {
        sockets.forEach(function(socket) {
            socket.emit(event, data);
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

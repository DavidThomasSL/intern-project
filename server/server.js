var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');


module.exports = function(port, enableLogging) {
  var router = express();
  var server = http.createServer(router);
  var io = socketio.listen(server, { log: enableLogging });

  router.use(express.static(path.resolve(__dirname, '../client')));
  var messages = [];
  var sockets = [];

  io.on('connection', function (socket) {
      messages.forEach(function (data) {
        socket.emit('message', data);
      });

      sockets.push(socket);

      socket.on('disconnect', function () {
        sockets.splice(sockets.indexOf(socket), 1);
      });

      socket.on('message', function (msg) {
        var text = String(msg || '');

        if (!text)
          return;

        broadcast('message', text);
        messages.push(text);
      });
    });

  function broadcast(event, data) {
    sockets.forEach(function (socket) {
      socket.emit(event, data);
    });
  }

  server.listen(port, function(){
    var addr = server.address();
    if (enableLogging) {
      console.log("Chat server listening at port: " + addr.port);
    }
  });

  return server;
};

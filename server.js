var server = require("./server/server");

var port = process.env.PORT || 8080;

server(port, true);

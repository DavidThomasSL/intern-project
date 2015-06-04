var server = require("./server/server");

var port = process.env.PORT || 8080;
var ip =  process.env.IP || "http://localhost";

server(port, ip);

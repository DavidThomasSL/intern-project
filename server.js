var server = require("./server/server");

var port = process.env.PORT || 8080;

var debugFlag = process.argv[2];

if (debugFlag !== undefined) {
	debugFlag = debugFlag.split("=")[1];
} else {
	debugFlag = "true";
}

if (debugFlag === "true") {
	debugFlag = true;
	console.log("-----------------DEBUGGING ENABLED");
} else {
	debugFlag = false;
	console.log("-----------------DEBUGGING DISABLED");
}

server(port, debugFlag);

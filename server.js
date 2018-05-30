var express = require("express");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");

var app = express();
var root = __dirname + "/public";

// -------------------------------------------------------------
// SET UP PUSHER
// -------------------------------------------------------------
var Pusher = require("pusher");
var pusher = new Pusher({
  appId: "534611",
  key: "4f12dd5c9b8a00e59b61",
  secret: "5cda7e9ab75677332dc1"
});

// -------------------------------------------------------------
// SET UP EXPRESS
// -------------------------------------------------------------

// Parse application/json and application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Simple logger
app.use(function(req, res, next){
  console.log("%s %s", req.method, req.url);
  console.log(req.body);
  next();
});

// Error handler
app.use(errorHandler({
  dumpExceptions: true,
  showStack: true
}));

// Serve static files from directory
app.use(express.static(root));

// Message proxy
app.post("/message", function(req, res) {
  var socketId = req.body.socketId;
  var channel = req.body.channel;
  var message = req.body.message;

  pusher.trigger(channel, "message", message, socketId);

  res.send(200);
});

// Open server on specified port
console.log("Starting Express server");
app.listen(process.env.PORT || 5001);
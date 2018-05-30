var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'))

app.get('/', function(req, res){
  res.sendFile('public/index.html');
});

require('reliable-signaler')(http);

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

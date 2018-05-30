var socket_io = require("socket.io");

module.exports = function (server) {
  var users = {};
  var io = socket_io(server);
  io.on("connection", function(socket) {

    // ∆елание нового пользовател€ присоединитьс€ к комнате
    socket.on("room", function(message) {
      var json = JSON.parse(message);
      // ƒобавл€ем сокет в список пользователей
      users[json.id] = socket;
      if (socket.room !== undefined) {
        // ≈сли сокет уже находитс€ в какой-то комнате, выходим из нее
        socket.leave(socket.room);
      }
      // ¬ходим в запрошенную комнату
      socket.room = json.room;
      socket.join(socket.room);
      socket.user_id = json.id;
      // ќтправ€лем остальным клиентам в этой комнате сообщение о присоединении нового участника
      socket.broadcast.to(socket.room).emit("new", json.id);
    });

    // —ообщение, св€занное с WebRTC (SDP offer, SDP answer или ICE candidate)
    socket.on("webrtc", function(message) {
      var json = JSON.parse(message);
      if (json.to !== undefined && users[json.to] !== undefined) {
        // ≈сли в сообщении указан получатель и этот получатель известен серверу, отправл€ем сообщение только ему...
        users[json.to].emit("webrtc", message);
      } else {
        // ...иначе считаем сообщение широковещательным
        socket.broadcast.to(socket.room).emit("webrtc", message);
      }
    });

    //  то-то отсоединилс€
    socket.on("disconnect", function() {
      // ѕри отсоединении клиента, оповещаем об этом остальных
      socket.broadcast.to(socket.room).emit("leave", socket.user_id);
      delete users[socket.user_id];
    });
  });
};
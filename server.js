var socket_io = require("socket.io");

module.exports = function (server) {
  var users = {};
  var io = socket_io(server);
  io.on("connection", function(socket) {

    // ������� ������ ������������ �������������� � �������
    socket.on("room", function(message) {
      var json = JSON.parse(message);
      // ��������� ����� � ������ �������������
      users[json.id] = socket;
      if (socket.room !== undefined) {
        // ���� ����� ��� ��������� � �����-�� �������, ������� �� ���
        socket.leave(socket.room);
      }
      // ������ � ����������� �������
      socket.room = json.room;
      socket.join(socket.room);
      socket.user_id = json.id;
      // ���������� ��������� �������� � ���� ������� ��������� � ������������� ������ ���������
      socket.broadcast.to(socket.room).emit("new", json.id);
    });

    // ���������, ��������� � WebRTC (SDP offer, SDP answer ��� ICE candidate)
    socket.on("webrtc", function(message) {
      var json = JSON.parse(message);
      if (json.to !== undefined && users[json.to] !== undefined) {
        // ���� � ��������� ������ ���������� � ���� ���������� �������� �������, ���������� ��������� ������ ���...
        users[json.to].emit("webrtc", message);
      } else {
        // ...����� ������� ��������� �����������������
        socket.broadcast.to(socket.room).emit("webrtc", message);
      }
    });

    // ���-�� ������������
    socket.on("disconnect", function() {
      // ��� ������������ �������, ��������� �� ���� ���������
      socket.broadcast.to(socket.room).emit("leave", socket.user_id);
      delete users[socket.user_id];
    });
  });
};
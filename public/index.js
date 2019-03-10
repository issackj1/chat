let app = require('express')();
let express = require('express');
let http = require('http').Server(app);
let io = require('socket.io')(http);
let users = [];

app.use(express.static('public/'))
app.get('/', function(req, res){
  res.sendFile(__dirname + 'public/index.html');
});

io.on('connection', function (socket) {
  socket.nickname = ID();
  console.log(socket.nickname + ' connected');
  users.push(socket.nickname);
  io.emit('update users', users);
  io.emit('init-name', socket.nickname);

  socket.on('send-nickname', function (nickname) {
    if (!users.includes(nickname)) {
      let index = users.indexOf(socket.nickname);
      users[index] = nickname;
      socket.nickname = nickname;
      io.emit('update users', users);
    }
  })

  socket.on('disconnect', function () {
    console.log('a user disconnected');
    let temp = users;
    users = [];
    for (let value of temp) {
      if (value !== socket.nickname) { users.push(value) }
    }
    io.emit('update users', users);

  })

  socket.on('chat message', function (msg) {
    console.log('message: ' + msg + socket.nickname);
  });

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg, socket.nickname);
  });

});

//https://gist.github.com/gordonbrander/2230317
//io.emit('some event', { for: 'everyone' });
var ID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};


http.listen(3000, function () {
  console.log('listening on *:3000');
});
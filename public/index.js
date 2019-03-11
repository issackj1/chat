let app = require('express')();
let express = require('express');
let http = require('http').Server(app);
let io = require('socket.io')(http);
let cookieParser = require('cookie-parser')

let users = [];
let history = [];
let date = new Date();

app.use(express.static('public/'))
app.use(cookieParser ())

app.get('/', function(req, res) {
  res.cookie("My First Cookie", "Yeah!");
});

io.on('connection', function (socket) {
  socket.nickname = ID();
  socket.color = "black";
  users.push({
    name: socket.nickname,
    color: socket.color
  })
  //console.log(socket.nickname + ' connected' + socket.color);

  io.emit('update users', users);
  socket.emit('init-name', socket.nickname);
  socket.emit('update history', history);

  socket.on('/nick', function (nickname) {
    let exist = false;
    for (i = 0; i < users.length; i++) {
      if(users[i].name === nickname) { 
        exist = true; 
        break;
      }
    }
    if (!exist) {
      for (i = 0; i < users.length; i++) {
        if(users[i].name === socket.nickname){
          users[i].name = nickname;
        }
      }
      socket.nickname = nickname;
      socket.emit('init-name', socket.nickname);
      io.emit('update users', users);
    }
  })

  socket.on('change color', function (color) {
    for (i = 0; i < users.length; i++) {
      if(users[i].name === socket.nickname){
        users[i].color = color;
      }
    }
    io.emit('update users', users);
  })

  socket.on('disconnect', function () {
    console.log('a user disconnected');
    let temp = users;
    users = [];
    for (i = 0; i < temp.length; i++) {
      if(!(temp[i].name === socket.nickname)){
        users.push({
          name: temp[i].name,
          color: temp[i].color
        });
    }
    }
    io.emit('update users', users);

  })

  socket.on('chat message', function (msg) {
    console.log('message: ' + msg + socket.nickname);
  });

  socket.on('chat message', function (msg, color) {
    let minute = date.getMinutes();
    if (minute < 10) { minute = '0' + date.getMinutes() }
    history.push('(' + date.getHours() + ":" + minute + ')' + "\xa0\xa0" + socket.nickname + ":\xa0\xa0" + msg);
    socket.broadcast.emit('chat message', msg, '<span style=color:' + color + '>' + socket.nickname + '</span>');
    socket.emit('chat message', msg, '<b><span style=color:' + color + '>' + socket.nickname + '</span></b>');
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
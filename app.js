var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var qs= require('querystring');


server.listen(80);


var newColor="white";

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/', function (req, res) {
	var body = '';
	req.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                req.connection.destroy();
        });

        req.on('end', function () {
            var post = qs.parse(body);
            newColor = post.color;
            io.sockets.emit('color', {color: newColor});
        });
    res.end();

});


io.on('connection', function(socket){
  socket.emit('color', { color: newColor });

});

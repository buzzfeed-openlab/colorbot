var http = require('http');
var qs= require('querystring');

const PORT=8080; 

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});

var newColor="white";

function handleRequest (request, response) {
    if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            var post = qs.parse(body);
            console.log(post.color);
            newColor = post.color;
            response.end('It Works!! Path Hit: ' + request.url + ' with color ' + newColor);

        });
    }
    else if (request.method == 'GET') {
    	response.writeHeader(200,{"Content-Type": "text/html"});
    	response.write( '<body bgcolor ="' + newColor + '"></body><script>setTimeout(function(){location.reload();},1000);</script>')
    	response.end();
    }
}


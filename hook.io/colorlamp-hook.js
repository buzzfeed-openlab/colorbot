module['exports'] = function echoHttp (hook) {
  var https = require('https');
  var querystring = require('querystring');
  var env = hook.env;
  var token = env.particle_access_token;
  var request = require('request');

  var query = hook.params["text"];

  console.log('query: ',query);

  var qarray = query.split(" ");

  var func = qarray[0];
  var nickname = qarray[1];

  var deviceID;

  if (nickname == '[NAME-OF-LAMP-IN-SLACK]') {
    deviceID=env.particle_device_colorlamp;
  }

  var arg = qarray[2];

  var user = hook.params["user_name"];
  var timestamp = new Date();
  var offset = (timestamp.getTimezoneOffset())/60 - 7;

  timestamp.setUTCHours(timestamp.getUTCHours() + offset);
  var date = String(timestamp.getUTCFullYear()) + '-' + String(timestamp.getUTCMonth()) + '-' + String(timestamp.getUTCDate());
  var time = String(timestamp.getHours())+':'+String(timestamp.getMinutes())+':'+String(timestamp.getSeconds());

  if(deviceID != undefined && arg != undefined && func != undefined){
      var path = "https://api.particle.io/v1/devices/" + deviceID + "/" + func

      var data = querystring.stringify({
          args: arg,
          access_token: token
      });

      var options = {
  hostname: 'api.particle.io',
          port: 443,
          path: path,
          method: 'POST',

          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

    var req = https.request(options, function(res) {
  console.log('statusCode: ', res.statusCode);
        console.log('headers: ', res.headers);

          res.setEncoding('utf8');

        res.on('data', function(d) {

        });

          res.on('end', function () {
      // console.log(result);

              hook.res.end(returnValue);
    });
      });

      req.on('error', function(error){
          hook.res.end("Error: " + returnValue);
      });

      // console.log(data);

      req.write(data);
      req.end();
  }
  else{
      hook.res.end(returnValue);
  }

};

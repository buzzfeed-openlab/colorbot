module['exports'] = function echoHttp (hook) {
  var https = require('https');
  var querystring = require('querystring');
  var request = require('request');
  var MongoClient = require('mongodb').MongoClient, assert = require('assert');
  var waitUntil = require('wait-until');  // im lazy

  var env = hook.env;
  var post_url = env.colorbot_post_url;
  var log_url = env.colorbot_log_url;
  var hook_url = env.colorbot_hook_url;
  var db_h = env.colorbot_db_h;
  var db_u = env.colorbot_db_u;
  var db_p = env.colorbot_db_p;


  var ObjectId = require('mongodb').ObjectID;
  var colorList = ['red','orange','yellow','green','blue','purple','grey'];

  var query = hook.params["text"];
  var user = hook.params["user_name"];
  var timestamp = new Date();
  var offset = (timestamp.getTimezoneOffset())/60 - 7;
  timestamp.setUTCHours(timestamp.getUTCHours() + offset);
  var date = String(timestamp.getUTCFullYear()) + '-' + String(timestamp.getUTCMonth()) + '-' + String(timestamp.getUTCDate());
  var time = String(timestamp.getHours())+':'+String(timestamp.getMinutes())+':'+String(timestamp.getSeconds());


  if (user!="slackbot") {  // post information to the google spreadsheet to log it


    console.log('query: '+query);

    var qarray = query.split(" ");

    // function to parse emoji from query
    var parseEmoji = function(q) {
      // q is qarray
      // return emoji storage array
      var r = [];
      for (var x=0; x<q.length; x++) {
        if (qarray[x][0]==":") {
          // console.log(q[x].replace(/:/g,''));
          r.push(q[x].replace(/:/g,''));
        }
      }
      return r;
    }


    var updateEmoji = function(name, color, user, db, callback) {
     db.collection('color-emoji').updateOne(
        { "name" : name },
        { $set: { "color.current" : color , "color.update.user" : user },
          $currentDate: { "color.update.date" : true },
          $inc: {"color.update.times" : 1} },
        function(err, results) {
          console.log(results);
          callback();
     });
    };

      // function to find emoji in database based on query

    var findEmoji = function(list, db, callback) {
      var p=[];
       var cursor =db.collection('color-emoji').find({ name: {$in: list} });
       cursor.each(function(err, doc) {
          assert.equal(err, null);
          if (doc != null) {
            console.log(doc);
            p.push(doc);
          } else {
             callback();
          }
       });
      return p;
    };

    // cool so you defined variables and stuff. now let's get the list of emoji to query.

    var emoji = parseEmoji(qarray);

    if (emoji.length > 0) {
          request({
        uri: log_url,
        method: "POST",
        json: {
          date: date,
          time: time,
          user_name: user,
          text: query
          }
        });
    }

    // figure out if qarray is just saying emojis, or if it has an :emoji: and a :color: in it.
    if (emoji.length==2 && colorList.indexOf(emoji[1])>=0) {
      // if so, set the emoji equal to the indicated color and relay that to the user

      var updated = 0;

       MongoClient.connect(db_h, function(err, db) {
        assert.equal(null, err);
        db.authenticate(db_u, db_p, function(err, res){
          console.log("Connected correctly to server");
          updateEmoji(emoji[0], emoji[1], user, db, function() {
            db.close();
            updated = 1;
          });
        });
      });

      waitUntil()
        .interval(1000)
        .times(30)
        .condition(function() {
            return (updated==1);
        })
        .done(function(result) {
          var text = ":" + emoji[0] + ": makes me feel :" + emoji[1] + ":. Type `:" + emoji[0] + ":` to see!";
          console.log(text);
          request({
          uri: hook_url,
          method: "POST",
          json: {
            "fallback": "information about color and corresponding emojis sent by incoming webhook for colorbot",
            "text": text
            }
          });
          // also change color of the website
          var postdata="color="+emoji[1];
          request({
          uri: post_url,
          method: "POST",
          headers: {'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept' : '*/*',
                    'User-Agent': 'curl'},
          body: postdata
          });
        });

    }



    else {
      // open the db and get all the emojis that match up to this

      // remove duplicates
      emoji = emoji.filter(function(item, i, a){ return a.indexOf(item) === i; });

      var docs=[];
      var outgoingText='';

      MongoClient.connect(db_h, function(err, db) {
        assert.equal(null, err);
        db.authenticate(db_u, db_p, function(err, res){
          console.log("Connected correctly to server");
          docs = findEmoji(emoji, db, function() {
            db.close();
          });
        });
      });


    waitUntil()
      .interval(1000)
      .times(30)
      .condition(function() {
          return (docs!=[]);
      })
      .done(function(result) {
        console.log(docs);
        for (var x=0; x<docs.length; x++) {
          if (docs[x].color.current == '') {
            var text = "How does :" + docs[x].name + ": make me feel? (Respond with `:" + docs[x].name + ": is :[color]:`, emoji-listed colors only)";
            console.log(text);
            request({
            uri: hook_url,
            method: "POST",
            json: {
              "fallback": "information about color and corresponding emojis sent by incoming webhook for colorbot",
              "text": text
              }
            });
          }
          else {
            var text = ":"+docs[x].name+": makes me feel :"+docs[x].color.current + ":";
            console.log(text);
            request({
            uri: hook_url,
            method: "POST",
            json: {
              "fallback": "information about color and corresponding emojis sent by incoming webhook for colorbot",
              "text": text
              }
            });
            // also change color of the website
            var postdata="color="+docs[x].color.current;
            request({
            uri: post_url,
            method: "POST",
            headers: {'Content-Type': 'application/x-www-form-urlencoded',
                      'Accept' : '*/*',
                      'User-Agent': 'curl'},
            body: postdata
            });
          }
        }
      });

    }

  }

}

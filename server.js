//setup Dependencies
var connect = require('connect'),
    express = require('express'),
    //io = require('socket.io'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    jade = require('jade'),
    port = (process.env.PORT || 13319),
    user = 'guest',
    testModules = require( __dirname + '/commands')
    hello = require('./hello');


    io = require('socket.io');


console.log("testModules : ", testModules);

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found',
                  description: '',
                  author: '',
                  analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error',
                  description: '',
                  author: '',
                  analyticssiteid: 'XXXXXXX',
                  error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
  socket.emit('output', 'app restarted' );


  socket.on('ready', function () {
      socket.emit('init', init() );
  });

  socket.on('command', function (data) {
      console.log("data : ", data);
      //socket.emit('output', data);
      socket.broadcast.emit('output', parse(data, socket) );
      socket.emit('output', parse(data, socket) );
      //socket.emit('output', path);
  });

  socket.on('autocomplete', function (data) {
      console.log("autocomplete data : ", data);
      var response = autocomplete(data);
      socket.emit("complete", response);
  });

  socket.on('login', function (data) {
      console.log("data : ", data);
      socket.emit('output', 'checking' );
      authorize(data.login, data.password);
      //socket.emit('output', path);
  });
});

var commands = [];

var init = function() {
    // body...
    user = 'guest';
    result = 'blast!';
    return result;
};

var help =  function() {
    console.log("help function ");
    return "--> help function";
};
commands.help = help;

var testFun =  function() {
    console.log("testFun function ");
    //var result = fs.readdirSync('commands');
    var result = fs.readdirSync('node_modules');
    return result;
};
commands.testFun = testFun;

var testFunc =  function() {
    console.log("»»»»testFunc function ");
    io.sockets.emit('log', testModules);
    io.sockets.emit('output', testModules );
    hello.world();
    //return "--> testFunc function";
};
commands.testFunc = testFunc;

var login = function(fs, socket, mongoose, jade) {
   var loginForm = jade.compile( fs.readFileSync(__dirname + '/views/login.jade').toString('utf8'))() ;
   //console.log("loginForm : ", loginForm);
   //socket.emit('output', 'loginForm' );
   socket.emit('login', loginForm );
   //return jade.compile( fs.readFileSync('views/login.jade').toString('utf8'))() ;
};
commands.login = login;

var getGoogle = function(socket) {
    var http = require('http');
    // body...
    var options = {
      host: 'www.google.fr',
      port: 80
      //path: '/upload',
      //method: 'POST'
    };

    var result;

    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
        socket.emit('output', chunk );
        result = res;
        //return chunk;
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write('data\n');
    req.write('data\n');
    return req.end();
};
commands.getGoogle = getGoogle;

//fs.readdir('commands', function(err, files){
    ////commands = files;
    //console.log("files : ", files);
    //var response = "";
    //for (var file in files) {
        //var script = vm.createScript( files[file] );
        //console.log("script : ", script);
        /*
         *fs.readFile('commands/' + files[file], 'utf-8', function (err, data) {
         *    if (err) throw err;
         *    console.log(data);
         *    commands[files[file].split('.')[0]] = function() {data};
         *});
         */
        //fs.readFile('commands/' + files[file], function(err,data){
            //try {
                //var loaded_module = vm.createScript(data);
                ////loaded_module.runInNewContext({response: response});
                ////loaded_module.runInThisContext();
                //commands[files[file].split('.')[0]] = loaded_module;
            //}
            //catch(exception) {
                //console.error("There was an error running the script " + files[file] , exception);
            //}
        //});

    //}
//});



var parse = function (command, socket) {
    command = command.trim();
    var args = command.split(' ')[1];
    command = command.split(' ')[0];
    console.log("command : ", command);
    console.log("args : ", args);
    if (commands.hasOwnProperty( command ) ) {
        return commands[command](fs, socket, mongoose, jade);
        console.log( 'commands[command]', commands[command] );
        //return commands;
        var result;
        return commands[command].runInNewContext({args: args, require: require, console: console, result: result });
        //return commands[command].runInThisContext({args: args});
        //return commands[command].runInThisContext();
    }
    return command + " : Command not found";
};

var autocomplete = function (command) {
    var result = {};
    var matchingCommands = [];
    var count = 0;
    var reg = new RegExp( "^" + command );
    for (var i in commands) {
        if (commands.hasOwnProperty(i)) { // filter
            if ( reg.test(i) ) {
                matchingCommands.push(i);
            }
        }
    }
    console.log("matchingCommands : ", matchingCommands);
    if (matchingCommands.length === 1) {
        result.input = matchingCommands[0] + " ";
    }
    else {
        result.output = matchingCommands.join(" ");
        var contentTemp = [];

        var loopCount = matchingCommands.length;
        for (var index = 1; index < loopCount; index++) {
            for (var letter in matchingCommands[index]) {
                if (!!matchingCommands[index - 1][letter]) {
                    if (matchingCommands[index - 1][letter] === matchingCommands[index][letter]) {
                        contentTemp.push(matchingCommands[index][letter]);
                        console.log("contentTemp : ", contentTemp);
                    }
                    else {
                        break;
                    }
                }
            }
            if (!contentTemp.length) {
                break;
            }
        }
        result.input = contentTemp.join("");
    }
    return result;
};

var authorize = function(login, pass) {
      if (login === 'nc' && pass === 'pass' ) {
          user = login;
          io.sockets.emit('output', 'Welcome ' + user );
          io.sockets.emit('logged', user );
      }
      else {
          io.sockets.emit('notLogged', 'Wrong user or password' );
      }
};

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title',
              description: 'Your Page Description',
              author: 'Your Name',
              analyticssiteid: 'XXXXXXX',
              user: user
            }
  });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );

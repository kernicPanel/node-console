/* Author: YOUR NAME HERE
*/

/*
 *$(document).ready(function() {   
 *
 *  var socket = io.connect();
 *
 *  $('#sender').bind('click', function() {
 *   socket.emit('message', 'Message Sent on ' + new Date());     
 *  });
 *
 *  socket.on('server_message', function(data){
 *   $('#reciever').append('<li>' + data + '</li>');  
 *  });
 *});
 */

var nodeConsole = (function () {
    //var socket = io.connect('http://localhost');
    var socket = io.connect();
    var $console = $('#console');
    socket.emit('ready');
    socket.on('init', function (data) {
        $console.append( data );
        window.scrollBy(0, 100000000000000000);
        init();
    });

    var init = function() {
        // body...
        var publicAccess = {},
            $commandLine = $('#commandLine'),
            $output = $('#output'),
            $login,
            $password,
            $auth = $('#auth'),
            kCommandLine = new Kibo($commandLine.get(0)),
            kAuth;

        $commandLine.focus();

        $(document).on('click', function() {
            $commandLine.focus();
        });

        kCommandLine.down('tab', function() {
            socket.emit('autocomplete', $commandLine.val() );

            return false; 
        });

        kCommandLine.down('enter', function() {
            history.push( $commandLine.val() );
            history.reset();
            socket.emit('command', $commandLine.val() );
            $commandLine.val('');
            return false; 
        });

        kCommandLine.down('up', function() {
            $commandLine.val( history.prev() );
            return false;
        });

        kCommandLine.down('down', function() {
            $commandLine.val( history.next() );
            return false;
        });


        socket.on('log', function (data) {
            console.log("log : ", data);
        });

        socket.on('output', function (data) {
            console.log("data : ", data);
            //socket.emit('command', { my: 'data' });
            //globalData = data;
            if (data) {
                $output.append('<p>' + data + '</p>');
                window.scrollBy(0, 100000000000000000);
            }
        });

        socket.on('complete', function (data) {
            console.log("complete data : ", data);
            //socket.emit('command', { my: 'data' });
            if (!!data.output) {
                $output.append('<p>' + data.output + '</p>');
                window.scrollBy(0, 100000000000000000);
            }
            if (!!data.input) {
                $commandLine.val( data.input );
            }
         });

        socket.on('login', function(data) {
            console.log("login data : ", data);
            $auth.html(data);

            $login = $('#login');
            $password = $('#password');

            $login.focus();
            kAuth = new Kibo($auth.get(0));

            startLoginContext();

        });

        socket.on('logged', function(data) {
            console.log("data logged : ", data);
            $('#prompt').find('span').html(data);
            stopLoginContext();
        });

        socket.on('notLogged', function(data) {
            console.log("notLogged data : ", data);
            //var $login = $('#login');

            $auth.find('#error').html(data);
            $login.focus();
        });

        var startLoginContext = function() {
            $(document).off('click');

            kAuth.down('enter', function() {
                socket.emit('login', {login : $login.val(), password : $password.val()} );
                return false; 
            });

            kAuth.down('esc', function() {
                console.log("esc : ");
                stopLoginContext();
                return false; 
            });
        };

        var stopLoginContext = function() {
            $auth.html('');
            $(document).on('click', function() {
                $commandLine.focus();
            });
            $commandLine.focus();

        };


        var history = (function () {
            var publicAccess = {},
            commands = [],
            current = false;

            function push(command) {
                if ( command ){
                    commands.push(command);
                }
            }

            function previousCommand() {
                if (current && current > 0) {
                    current--;
                }
                else if (!current && current !== 0 && commands.length) {
                    current = commands.length - 1;
                }
                return commands[current];
            }

            function nextCommand() {
                if (current !== false && current < commands.length) {
                    current++;
                }
                else {
                    return "";
                }
                return commands[current];
            }

            function resetCurrent() {
                console.log("reset: ");
                current = false;
            }

            publicAccess.prev = function () {
                return previousCommand();
            };

            publicAccess.next = function () {
                return nextCommand();
            };

            publicAccess.reset = function () {
                resetCurrent();
            };

            publicAccess.push = function (command) {
                push(command);
            };

            return publicAccess;
        }());


        function privateMethod() {

        }

        //publicAccess.moduleProperty = ;
        //publicAccess.moduleMethod = function () {

        //};

        return publicAccess;
    };
}());

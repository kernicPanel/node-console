//var io = require('socket.io');
exports.world = function() {
    console.log('Hello World');
    io.sockets.broadcast.emit('output', 'yooo' );
}

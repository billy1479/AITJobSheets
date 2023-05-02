const app = require('./app.js');
const http = require('http');
const myServer = http.createServer(app);
const { Server } = require('socket.io');
const port = 8090;
const mySocket = new Server(myServer);

myServer.listen(port, () => {
    console.log('Job Sheet Server is running on port ' + port);
});

mySocket.on('connection', (socket) => {
    if (mySocket.engine.clientsCount > 1) {
        socket.emit('err', { message: 'reach the limit of connections' });
        socket.disconnect();
    };
});

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));


// simple in-memory user map: socketId -> username
const users = new Map();


io.on('connection', (socket) => {
console.log('a user connected:', socket.id);


// when a user sets their username and joins
socket.on('join', (username) => {
users.set(socket.id, username || 'Anonymous');
socket.broadcast.emit('system message', `${users.get(socket.id)} joined the chat`);
io.emit('users', Array.from(users.values())); // update user list
});


// chat message
socket.on('chat message', (msg) => {
const username = users.get(socket.id) || 'Anonymous';
const payload = {
id: socket.id,
username,
message: msg,
ts: Date.now()
};
io.emit('chat message', payload);
});


// typing indicator
socket.on('typing', (isTyping) => {
const username = users.get(socket.id) || 'Anonymous';
socket.broadcast.emit('typing', { username, isTyping });
});


socket.on('disconnect', () => {
const username = users.get(socket.id);
if (username) {
users.delete(socket.id);
socket.broadcast.emit('system message', `${username} left the chat`);
io.emit('users', Array.from(users.values()));
}
console.log('user disconnected:', socket.id);
});
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});

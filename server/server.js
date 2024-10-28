const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
app.use(cors());

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

const users = {}; // Object to keep track of connected users
const messages = {}; // Object to store messages for each user

// API endpoint to get users
app.get('/api/users', (req, res) => {
    res.json(Object.keys(users)); // Return the list of user IDs
});

// API endpoint to get messages for a specific user
app.get('/api/messages/:userId', (req, res) => {
    const userId = req.params.userId;
    res.json(messages[userId] || []); // Return messages or an empty array if none exist
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // When a user connects, they can send their ID (e.g., username)
    socket.on('registerUser', (userId) => {
        users[userId] = socket.id; // Store the user's socket ID
        messages[userId] = messages[userId] || []; // Initialize the user's message history
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);
        const receiverSocketId = users[data.receiverId];
        if (receiverSocketId) {
            // Store the message in both sender and receiver message history
            messages[data.senderId] = messages[data.senderId] || [];
            messages[data.receiverId] = messages[data.receiverId] || [];
            messages[data.senderId].push(data); // Store the message for sender
            messages[data.receiverId].push(data); // Store the message for receiver

            io.to(receiverSocketId).emit('receiveMessage', data);
        } else {
            console.log('User not found:', data.receiverId);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Optionally remove the user from the users object when they disconnect
    });
});

// const { Sequelize, DataTypes } = require('sequelize');
// const sequelize = new Sequelize('YOUR_DB_NAME', 'YOUR_DB_USER', 'YOUR_DB_PASSWORD', {
//     host: 'YOUR_RDS_ENDPOINT',
//     dialect: 'mysql', // or 'postgres'
// });

// const User = sequelize.define('User', {
//     id: {
//         type: DataTypes.STRING,
//         primaryKey: true,
//     },
//     username: DataTypes.STRING,
// });

// const Message = sequelize.define('Message', {
//     senderId: DataTypes.STRING,
//     receiverId: DataTypes.STRING,
//     content: DataTypes.TEXT,
// });

// User.hasMany(Message, { as: 'SentMessages', foreignKey: 'senderId' });
// User.hasMany(Message, { as: 'ReceivedMessages', foreignKey: 'receiverId' });


server.listen(4000, () => console.log('Server running on port 4000'));

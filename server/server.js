// Import necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
    origin: '*',
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
};

app.use(cors(corsOptions));

// Configure Socket.io
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
    },
});

const users = {}; // Object to track connected users by ID
const messages = {}; // Object to store messages per user

// Database Configuration
const config = require('./rds-config');
const sequelize = new Sequelize(config.dbName, config.dbUser, config.dbPassword, {
    host: config.dbHost,
    port: config.dbPort,
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    logging: false,
});

// Define User Model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.STRING(100),
        primaryKey: true,
    },
    email: {
        type: DataTypes.STRING(255),
    },
    name: {
        type: DataTypes.STRING(255),
    },
    lastname: {
        type: DataTypes.STRING(255),
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW,
    },
}, {
    tableName: 'users',
    timestamps: false,
});

// Define Message Model
const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    senderId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'sender_id',
        references: {
            model: User,
            key: 'id'
        }
    },
    receiverId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'receiver_id',
        references: {
            model: User,
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: Sequelize.NOW,
    }
}, {
    tableName: 'messages',
    timestamps: false,
});


// Endpoint to Get User ID by Email
app.get('/api/getUserIdByEmail', async (req, res) => {
    const { email } = req.query;

    try {
        // Query database to find the user by email
        const user = await User.findOne({
            where: { email },
            attributes: ['id'], // Fetch only the ID
        });

        if (user) {
            res.json({ id: user.id });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user ID by email:', error);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// Existing API endpoints and socket configuration (unchanged)
app.get('/api/users', async (req, res) => {
    const userIds = await getUserIds();
    res.json(userIds);
});

app.get('/api/messages/:userId', async (req, res) => {
    const userId = req.params.userId;
    const contactId = req.query.contactId; // Retrieve contactId from query params

    try {
        const userMessages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId, receiverId: contactId },
                    { senderId: contactId, receiverId: userId }
                ]
            },
            order: [['createdAt', 'ASC']],
        });
        res.json(userMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Error fetching messages' });
    }
});


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('registerUser', (userId) => {
        users[userId] = socket.id;
        messages[userId] = messages[userId] || [];
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    // Handle incoming messages and save to database
    socket.on('sendMessage', async (messageData) => {
        const { senderId, receiverId, content } = messageData;
        
        try {
            // Save message to the database
            const message = await Message.create({
                senderId,
                receiverId,
                content,
            });
            console.log('Message saved to DB:', message);

            // Send message to receiver if they are connected
            const receiverSocketId = users[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveMessage', messageData);
            }
        } catch (error) {
            console.error('Error saving message to DB:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


server.listen(4000, () => console.log('Server running on port 4000'));

// Helper function to fetch all users' IDs and emails from the database
async function getUserIds() {
    try {
        await sequelize.authenticate();
        console.log('Connected to the PostgreSQL database.');

        const users = await User.findAll({
            attributes: ['id', 'email'],
        });

        return users.map(user => ({
            id: user.id,
            email: user.email,
        }));
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return [];
    }
}

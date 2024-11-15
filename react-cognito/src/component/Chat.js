import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = 'http://3.85.214.127:4000';
const socket = io(SERVER_URL);

function Chat({ email }) {
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [users, setUsers] = useState([]);
    const [chat, setChat] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [status, setStatus] = useState('Connecting...');
    const [userId, setUserId] = useState(null); // Store the actual database ID

    // Fetch the database ID based on email
    useEffect(() => {
        const fetchUserId = async () => {
            console.log(`Fetching user ID for email: ${email}`);
            try {
                const response = await axios.get(`${SERVER_URL}/api/getUserIdByEmail`, { params: { email } });
                console.log("User ID fetched:", response.data.id);
                setUserId(response.data.id); // Set the database ID
            } catch (error) {
                console.error('Error fetching user ID:', error);
            }
        };
        
        if (email) fetchUserId();
    }, [email]);

    // Fetch users and handle socket events
    useEffect(() => {
        if (!userId) return; // Ensure userId is available before proceeding

        console.log(`Registering user with ID: ${userId} on socket`);
        socket.emit('registerUser', userId);

        const fetchUsers = async () => {
            console.log("Fetching user list...");
            try {
                const response = await axios.get(`${SERVER_URL}/api/users`);
                const filteredUsers = response.data.filter(user => user.id !== userId); // Filter out current user
                setUsers(filteredUsers);
                console.log("User list fetched:", filteredUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();

        socket.on('connect', () => {
            console.log("Socket connected");
            setStatus('Connected to server');
        });
        
        socket.on('disconnect', () => {
            console.log("Socket disconnected");
            setStatus('Disconnected from server');
        });

        socket.on('receiveMessage', (data) => {
            console.log("Message received:", data);
            setChat((prevChat) => ({
                ...prevChat,
                [data.senderId]: [...(prevChat[data.senderId] || []), data],
            }));
        });

        // Cleanup on component unmount
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('receiveMessage');
        };
    }, [userId]);

    // Send a message to the selected user
    const sendMessage = () => {
        if (!message.trim() || !receiverId) {
            alert("Please enter a message and select a receiver.");
            return;
        }

        const messageData = { content: message, receiverId, senderId: userId };
        console.log("Sending message:", messageData);
        socket.emit('sendMessage', messageData);

        setChat((prevChat) => ({
            ...prevChat,
            [receiverId]: prevChat[receiverId]
                ? [...prevChat[receiverId], messageData]
                : [messageData],
        }));
        setMessage('');
    };

    // Select a user to chat with and fetch chat history
    const handleUserClick = async (user) => {
        setReceiverId(user.id);
        setSelectedUser(user);
        
        try {
            console.log(`Fetching messages with user ID: ${user.id}`);
            const response = await axios.get(`${SERVER_URL}/api/messages/${userId}`, {
                params: { contactId: user.id }, // Pass the contact ID as a query parameter
            });
            setChat((prevChat) => ({
                ...prevChat,
                [user.id]: response.data,
            }));
            console.log("Messages fetched:", response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    

    return (
        <div style={{ display: 'flex' }}>
            <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '10px' }}>
                <h3>Users</h3>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {users.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedUser?.id === user.id ? '#f0f0f0' : 'transparent',
                                padding: '5px',
                                margin: '5px 0'
                            }}
                        >
                            {user.email}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
                <h2>{status}</h2>
                <h3>Your User ID: {userId}</h3>
                <h3>Chat with: {selectedUser ? selectedUser.email : 'Select a user'}</h3>
                <div style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
                    {selectedUser && chat[selectedUser.id]?.map((msg, idx) => (
                        <p key={idx} style={{ 
                            textAlign: msg.senderId === userId ? 'right' : 'left', 
                            color: msg.senderId === userId ? 'blue' : 'black' 
                        }}>
                            <strong>{msg.senderId === userId ? 'You' : selectedUser.email}:</strong> {msg.content}
                        </p>
                    ))}
                </div>
                <input 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Type a message"
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default Chat;

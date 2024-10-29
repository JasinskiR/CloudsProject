import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:4000');

function Chat({ userId }) {
    const [message, setMessage] = useState('');
    const [receiverId, setReceiverId] = useState('');
    const [users, setUsers] = useState([]);
    const [chat, setChat] = useState({});
    const [selectedUser, setSelectedUser] = useState('');
    const [status, setStatus] = useState('default');

    useEffect(() => {
        if (userId) {
            socket.emit('registerUser', userId);

            const fetchUsers = async () => {
                try {
                    const response = await axios.get('http://localhost:4000/api/users');
                    // Exclude the current user from the list of users
                    setUsers(response.data.filter(user => user !== userId));
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };

            fetchUsers();

            socket.on('connect', () => {
                setStatus('Connected to server');
                console.log('Connected:', socket.id);
            });

            socket.on('disconnect', () => {
                setStatus('Disconnected from server');
                console.log('Disconnected:', socket.id);
            });

            socket.on('receiveMessage', (data) => {
                setChat((prevChat) => ({
                    ...prevChat,
                    [data.senderId]: prevChat[data.senderId]
                        ? [...prevChat[data.senderId], data]
                        : [data],
                }));
            });

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('receiveMessage');
            };
        }
    }, [userId]);

    const sendMessage = () => {
        if (message.trim() && receiverId.trim()) {
            const messageData = { message, receiverId, senderId: userId };

            socket.emit('sendMessage', messageData);

            setChat((prevChat) => ({
                ...prevChat,
                [receiverId]: prevChat[receiverId]
                    ? [...prevChat[receiverId], messageData]
                    : [messageData],
            }));

            setMessage('');
        } else {
            alert("Please enter a message and receiver ID.");
        }
    };

    const handleUserClick = async (userId) => {
        setReceiverId(userId);
        setSelectedUser(userId);

        try {
            const response = await axios.get(`http://localhost:4000/api/messages/${userId}`);
            setChat((prevChat) => ({
                ...prevChat,
                [userId]: response.data,
            }));
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
                            key={user}
                            onClick={() => handleUserClick(user)}
                            style={{
                                cursor: 'pointer',
                                backgroundColor: selectedUser === user ? '#f0f0f0' : 'transparent',
                                padding: '5px',
                                margin: '5px 0'
                            }}
                        >
                            {user}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
                <h2>{status}</h2>
                <h3>Your User ID: {userId}</h3>
                <h3>Chat with: {selectedUser || 'Select a user'}</h3>
                <div style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px', minHeight: '100px' }}>
                    {selectedUser && chat[selectedUser]?.map((msg, idx) => (
                        <p key={idx} style={{ 
                            textAlign: msg.senderId === userId ? 'right' : 'left', 
                            color: msg.senderId === userId ? 'blue' : 'black' 
                        }}>
                            <strong>{msg.senderId === userId ? 'You' : msg.senderId}:</strong> {msg.message}
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

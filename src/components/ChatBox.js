import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import config from '../config/config';

function stringToColor(str) {
  // Simple hash to pastel color
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
}

const ChatBox = ({ currentUser, chatPartner, token }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Helper function to get consistent ID
  const getUserId = (user) => user.id || user._id;

  // Fetch initial messages
  useEffect(() => {
    if (!chatPartner) return;
    setLoading(true);
    setError('');
    axios.get(`${config.API_URL}/chat/conversation`, {
      params: {
        userId: currentUser.role === 'user' ? getUserId(currentUser) : getUserId(chatPartner),
        therapistId: currentUser.role === 'therapist' ? getUserId(currentUser) : getUserId(chatPartner)
      },
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setMessages(res.data))
      .catch((err) => {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages');
      })
      .finally(() => setLoading(false));
  }, [chatPartner, currentUser, token]);

  // Setup socket.io
  useEffect(() => {
    if (!token || !chatPartner) return;
    
    const socket = io(config.SOCKET_URL, {
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Socket connection error: ' + err.message);
    });

    socket.on('receive_message', (msg) => {
      // Only add if relevant to this conversation
      const currentUserId = getUserId(currentUser);
      const chatPartnerId = getUserId(chatPartner);
      
      if (
        (msg.sender.id === currentUserId && msg.receiver.id === chatPartnerId) ||
        (msg.sender.id === chatPartnerId && msg.receiver.id === currentUserId)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, chatPartner, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    setError('');
    socketRef.current.emit('send_message', {
      receiverId: getUserId(chatPartner),
      receiverRole: chatPartner.role,
      message: input
    });
    setInput('');
  };

  if (!chatPartner) {
    return <div className="p-4 text-gray-500">Select a chat partner to start messaging.</div>;
  }

  // Avatar: first letter, pastel bg
  const avatar = (
    <div
      className="w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow"
      style={{ background: stringToColor(chatPartner.name || chatPartner.id) }}
    >
      {(chatPartner.name || '?')[0].toUpperCase()}
    </div>
  );

  return (
    <div className="flex flex-col h-96 border rounded-2xl shadow bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b bg-gradient-to-r from-blue-100 to-purple-100">
        {avatar}
        <div className="font-semibold text-lg text-blue-900">{chatPartner.name}</div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gradient-to-br from-blue-50 to-purple-50">
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.length === 0 ? (
            <div className="text-gray-400">No messages yet.</div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender.id === getUserId(currentUser);
              return (
                <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 max-w-xs shadow text-sm ${isMe ? 'bg-gradient-to-r from-blue-400 to-blue-300 text-white' : 'bg-white border text-gray-800'}`}
                    style={{ borderRadius: '18px 18px 4px 18px' }}
                  >
                    {msg.message}
                    <div className="text-[10px] text-right text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center border-t px-3 py-2 bg-white">
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-full font-semibold shadow hover:scale-105 transition"
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
      {error && <div className="text-red-500 text-xs p-2">{error}</div>}
    </div>
  );
};

export default ChatBox; 
const express = require('express');
const { chats } = require('./data');
const dotenv = require('dotenv');
const mongoDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messagesRoutes = require('./routes/messageRoutes');
const { errorNotFound, errorHandler } = require('./middleware/errorMiddleware');
const Chat = require('./models/chatModel');
const asyncHandler = require('express-async-handler');
const User = require('./models/userModel');
const path = require('path')

dotenv.config();

mongoDB();
const app = express();

app.use(express.json());

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messagesRoutes);

// -----------------Deployment-------------------

const __dirname1 = path.resolve()
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname1, '../client/build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname1, 'client', 'build', 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('API is running');
  });
}


// -----------------Deployment-------------------

app.use(errorNotFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server listening on port ${PORT}`));

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:3000", "https://chatzspot.onrender.com"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('⚡ User connected to socket.io:', socket.id);

  socket.on('setup', (userId) => {
    if (!userId) return console.error('❌ setup event missing userId');

    socket.join(userId);
    console.log(`✅ User ${userId} joined room: ${userId}`);
    console.log("📌 Current socket rooms:", socket.rooms);

    socket.emit('connected');
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });

  socket.on('typing', (room) => {
    if (!room || !room.chatId || !room.userId) {
      return console.error('❌ Invalid room object in typing event');
    }

    room.users.forEach((id) => {
      if (id === room.userId) return
      socket.to(id).emit('typing', { id: room.userId, name: room.name, typingChatId: room.chatId });
    })

  });

  socket.on('stop typing', (room) => {
    if (!room || !room.chatId || !room.userId) {
      return console.error('❌ Invalid room object in stop typing event');
    }

    room.users.forEach((id) => {
      if (id === room.userId) return
      socket.to(id).emit('stop typing', { id: room.userId, typingChatId: room.chatId });
    })
  });

  socket.on('new message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat?.users) return console.error('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return; // Don't send to sender
  
      console.log(`Sending message to ${user._id}`); // Debugging
      socket.to(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on('unread messages', async ({ chatId, userId, seen, newList }) => {
    console.log("Unread messages event triggered for chat:", chatId, "and user:", userId);

    try {
      const chat = await Chat.findById(chatId);
      if (!chat) return console.error("Chat not found!");

      if (seen) {
        chat.unreadMessages.set(userId.toString(), 0)
        await chat.save();
      } 

      if (!newList) return

      const updatedChats = await Chat.find({ users: userId })
          .populate('users', '-password')
          .populate('groupAdmin', '-password')
          .populate({
            path: 'latestMessage',
            populate: { path: 'sender', select: 'userName' } // Ensure sender is populated
          })
          .sort({ updatedAt: -1 });
          
      io.to(userId.toString()).emit('unread chatlist', updatedChats)
      console.log(`Unread count updated for chat ${chatId}, user ${userId}`);
    } catch (err) {
      console.error("Error updating unread messages:", err);
    }
  });

});

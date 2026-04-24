const socketIO = require("socket.io");
const http = require("http");
const express = require("express");
const cors = require("cors");

require("dotenv").config({ path: "./.env" });

const app = express();
const server = http.createServer(app);

// CORS — allow frontend origin
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("E-Shop Socket Server is running!");
});

// ─── User Management ───────────────────────────────────────────────
let users = [];

const addUser = (userId, socketId) => {
  const exists = users.some((user) => user.userId === userId);
  if (!exists) {
    // FIXED: was users.push((userId, socketId)) — comma operator, only socketId was saved
    // Now correctly pushing an object { userId, socketId }
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (receiverId) => {
  return users.find((user) => user.userId === receiverId);
};

// ─── Message Tracking ──────────────────────────────────────────────
const createMessage = ({ senderId, receiverId, text, images }) => ({
  senderId,
  receiverId,
  text,
  images,
  seen: false,
});

// ─── Socket Events ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User joins — add to online list
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    // Send updated online users list to everyone
    io.emit("getUsers", users);
  });

  // Per-socket message store
  const messages = {};

  // Send message
  socket.on("sendMessage", ({ senderId, receiverId, text, images }) => {
    const message = createMessage({ senderId, receiverId, text, images });
    const user = getUser(receiverId);

    // Store message in memory
    if (!messages[receiverId]) {
      messages[receiverId] = [message];
    } else {
      messages[receiverId].push(message);
    }

    // Deliver to receiver if online
    if (user?.socketId) {
      io.to(user.socketId).emit("getMessage", message);
    }
  });

  // Message seen
  socket.on("messageSeen", ({ senderId, receiverId, messageId }) => {
    const user = getUser(senderId);

    // FIXED: was `if (messageId[senderId])` — messageId is a string, not an object
    // Should check messages[senderId] array
    if (messages[senderId]) {
      const message = messages[senderId].find(
        (msg) => msg.receiverId === receiverId && msg.id === messageId
      );
      if (message) {
        message.seen = true;
        if (user?.socketId) {
          io.to(user.socketId).emit("messageSeen", {
            senderId,
            receiverId,
            messageId,
          });
        }
      }
    }
  });

  // Update last message in conversation list
  socket.on("updateLastMessage", ({ lastMessage, lastMessagesId }) => {
    io.emit("getLastMessage", { lastMessage, lastMessagesId });
  });

  // User disconnects
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    removeUser(socket.id);
    // FIXED: was emitting "getUser" (singular) — frontend listens to "getUsers" (plural)
    io.emit("getUsers", users);
  });
});

// ─── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});

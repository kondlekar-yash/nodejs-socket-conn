require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const productRoutes = require("./routes/product-routes");
const bookRoutes = require("./routes/book-routes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((e) => console.log(e));

// Middleware
app.use(express.json());
app.use(express.static("public"));

// API Routes
app.use("/products", productRoutes);
app.use("/reference", bookRoutes);

// Socket.io logic
const users = new Set();

io.on("connection", (socket) => {
  console.log("A user is now connected");

  socket.on("join", (userName) => {
    users.add(userName);
    socket.userName = userName;
    io.emit("userJoined", userName);
    io.emit("userList", Array.from(users));
  });

  socket.on("chatMessage", (message) => {
    io.emit("chatMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.userName);
    users.delete(socket.userName);
    io.emit("userLeft", socket.userName);
    io.emit("userList", Array.from(users));
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}`);
});

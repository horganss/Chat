const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "*", 
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    exposedHeaders: ['Set-Cookie'], 
    allowedHeaders: ['Content-Type', 'X-Auth-Token', 'Origin', 'Authorization'] // Allow specified headers
  })
);

const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

server.listen(80, () => {
  console.log("Server running on port 3400");
});

io.on("connection", socket => {
  console.log("User connected: " + socket.id);

  socket.on("message", data => {
    socket.broadcast.emit("message", data);
    //unread msg
    socket.on("unread", () => {
      socket.broadcast.emit("unread");
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });

  socket.on("seen", () => {
    //console.log("seen dude");
    socket.broadcast.emit("seen");
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

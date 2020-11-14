require("dotenv").config();
const http = require("http")
const express = require("express");
const cors = require("cors")
const startDB = require("./config/startDB");
const app = express();
const userRouter = require("./services/user")
const covidRouter = require("./services/covid");
const newsRouter = require("./services/news")
const chatRouter = require("./services/chat/rooms")
const weatherRouter = require('./services/weather')
const passport = require('./utils/oauth');
const socketio = require("socket.io");
const {
  catchAllHandler,
  forbiddenHandler,
  unauthorizedHandler,
  notFoundHandler
} = require("./middlewares/errorHandler")

//const morgan = require("morgan");
//const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const listEndPoints = require("express-list-endpoints");
const { userEntry, getUsersInRoom, getUser, removeUser } = require("./utils/userRoom");
const MessageModel = require("./Models/Message");
const port = process.env.PORT

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cookieParser())
app.use(cors())
app.use(express.json())
app.use(passport.initialize())
app.use("/user", userRouter)
app.use("/covid", covidRouter)
app.use("/news", newsRouter)
app.use("/weather", weatherRouter)
app.use("/chatRooms", chatRouter)

// Error handlers
app.use(notFoundHandler)
app.use(unauthorizedHandler)
app.use(forbiddenHandler)
//app.use(catchAllHandler)

/* if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"))
} else {
    app.use(helmet())
} */
const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('connected user', socket.id)
  //Joining event
  socket.on('join', async (options) => {
    console.log('joined', options)
    // add client to db
    const { username, room } = await userEntry({
      id: socket.id,
      ...options,

    })
    console.log('123456', { username, room })


    // join to the room
    socket.join(room)

    //send message to user entered
    socket.emit('message', {
      sender: "Admin",
      text: `${username}, Welcome to ${room} room`,
      createdAt: new Date(),
    })

    // send message to other users but not the user entered
    socket.broadcast.to(room).emit("message", {
      sender: "Admin",
      text: `${username} joined the channel`,
      createdAt: new Date()
    })

    const roomMembers = await getUsersInRoom(room)
    // send message to every member of the room
    io.to(room).emit("roomData", { room: room, users: roomMembers })
  })
  //send messages to all members

  socket.on("sendMessage", async ({ room, message, image }) => {
    const user = await getUser(room, socket.id)
    //save the message in collection

    const newMessage = new MessageModel({
      sender: user.username,
      text: message,
      room,
      image
    })

    await newMessage.save()
    console.log(newMessage)
    //search for sender username
    const messageUsername = {
      sender: user.username,
      text: message,
      image,
      createdAt: new Date()
    }
    io.to(room).emit("message", messageUsername)
  })

  socket.on("leaveRoom", async ({ room }) => {
    try {
      const user = await removeUser(socket.id, room)
      const message = {
        username: "Admin",
        text: `${user.username} has left!`,
        createdAt: new Date(),
      }

      const roomMembers = await getUsersInRoom(room)

      if (user) {
        io.to(room).emit("message", message)
        io.to(room).emit("roomData", {
          room: room,
          users: roomMembers,
        })
      }
    } catch (error) {
      console.log(error)
    }
  })
})

server.listen(port)
server.on("listening", () => {
  startDB()
})
server.on("error", (err) => console.log(err))
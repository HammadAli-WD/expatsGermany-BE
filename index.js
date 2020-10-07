require("dotenv").config();
const http = require("http")
const express = require ("express");
const cors = require("cors")
const startDB = require("./config/startDB");
const app = express();
const authorize = require("./middlewares/authorize")
const userRouter = require("./services/user")
const covidRouter = require("./services/covid");
const newsRouter = require("./services/news")
const passport = require('./utils/oauth');
const socketio = require("socket.io");


//const morgan = require("morgan");
//const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const listEndPoints = require("express-list-endpoints");
const { userEntry } = require("./services/chat/userroom");
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
app.use(cors(corsOptions))
app.use(express.json())
app.use(passport.initialize())
app.use("/user", userRouter)
app.use("/covid", covidRouter)
app.use("/news", newsRouter)


/* if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"))
} else {
    app.use(helmet())
} */
const server = http.createServer(app);
const io = socketio(server);
io.on('connection', (socket) =>{
  console.log('connected user', socket.id)
  //Joining event
  socket.on('join', async (options) => {
    console.log('joined', options)
    // add client to db
    await userEntry({
      roomName: options.room,
      username: options.username,
      id: socket.id
    })
    // join to the room
    socket.join(options.room)

    //send message to user entered
    socket.emit('message', {
      sender: "Admin",
      text: "Welcome",
      createdAt: new Date(),
    })

    // send message to other users but not the user entered
    socket.broadcast.to(options.room).emit("message", {
      sender: "Admin",
      text: `${options.username} joined the channel`,
      createdAt: new Date()
    })

    const list = []

    // send message to every member of the room
    io.to(options.room).emit("roomData", { room: options.room, members: list})
  })
})

server.listen(port)
server.on("listening", ()=> {
    startDB()
})
server.on("error", (err) => console.log(err))
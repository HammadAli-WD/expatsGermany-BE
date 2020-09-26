require("dotenv").config();
const http = require("http")
const express = require ("express");
const cors = require("cors")
const startDB = require("./config/startDB");
const app = express();
const authorize = require("./middlewares/authorize")
const userRouter = require("./services/user")
const covidRouter = require("./services/covid")
const passport = require('./utils/oauth');


//const morgan = require("morgan");
//const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const listEndPoints = require("express-list-endpoints");
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

/* if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"))
} else {
    app.use(helmet())
} */
const server = http.createServer(app);

server.listen(port)
server.on("listening", ()=> {
    startDB()
})
server.on("error", (err) => console.log(err))
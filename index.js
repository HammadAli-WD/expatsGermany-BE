require("dotenv").config();
const express = require ("express");
const startDB = require("./config/startDB");
const services = require("./services");
const app = new express();
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors")
const cookieParser = require("cookie-parser");
const listEndPoints = require("express-list-endpoints");
const port = process.env.PORT
app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use ("/api", services)


if(process.env.NODE_ENV !== "production"){
    app.use(morgan("dev"))
} else {
    app.use(helmet())
}
const server = require("http").createServer(app);

server.listen(port)
server.on("listening", ()=> {
    startDB()
})
server.on("error", (err) => console.log(err))
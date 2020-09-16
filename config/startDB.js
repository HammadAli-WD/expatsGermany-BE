const mongoose = require("mongoose")
const url = process.env.MONGODB_URI;
const port = process.env.PORT

function startDB() {
    mongoose
    .connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, db) => {
        if(err){
            console.log(err)
        } else {
            console.log(`DB running on port: ${port}`)
        }
    })   
}

module.exports = startDB;
const { Schema } = require("mongoose");
const mongoose = require("mongoose")

const MessageSchema = new Schema ({
    sender: String,
    text: String,
    room: {
        type: String,       
        ref: "ChatRooms"
    }
})

const MessageModel = mongoose.model("Message", MessageSchema)

module.exports = MessageModel;
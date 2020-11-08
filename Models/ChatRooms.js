const { Schema } = require('mongoose');
const mongoose = require('mongoose');

const RoomSchema = new Schema({
    name: String,
    members: [
        {
            username: String,
            id: String
        },
    ],
    image: String,
    description: String
},
    { timestamps: true }
)

module.exports = mongoose.model("ChatRooms", RoomSchema)
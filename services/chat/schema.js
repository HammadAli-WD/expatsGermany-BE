const {Schema} = require('mongoose');
const mongoose = require('mongoose');

const RoomSchema = new Schema({
    name: String,
    members:[{
        username: String,
        id: String
    }]
})

const RoomModel = mongoose.model('room', RoomSchema)

module.exports = RoomModel
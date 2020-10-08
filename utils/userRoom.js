const RoomModel = require('../Models/ChatRooms');

 const createChatRoom = async (req, res) => {
    const { name } = req.body
    const hasChatRoom = await RoomModel.findOne({ name })
     if (hasChatRoom) throw "Chatroom exists"
     const chatRoom = new RoomModel({
         name
     })

     await chatRoom.save()

     res.send(chatRoom.name)
} 
 

const userEntry = async ({ roomName, username, id }) => {
    try {
        // check if user already there
        const user = await RoomModel.findOne({
            name: roomName,
            "members.username": username,
        })
        console.log(user)
        // changing user id if already exists
        if (user) {
            await RoomModel.findOneAndUpdate(
                { name: roomName, "members.username": username},
                { "members.$.id": id}
            )
        } else {
            // Otherwise we are gonna add him to the members array
            await RoomModel.findOneAndUpdate(
                { name: roomName },
                { $addToSet: { members: {username, id}}}
            )
        }
        return { username, roomName}
    } catch (error) {
        console.log(error)       
    }
}
const getUser = async (roomName, id) => {
    try {
        const room = await RoomModel.findOne({ name: roomName })
        const user = room.members.find((member)=> member.id === id)
        return user
    } catch (error) {
        console.log(error)
        
    }
}

const getUsersInRoom = async (roomName) => {
    const room = await RoomModel.findOne({ name: roomName })
    return room.members
}
module.exports = { userEntry, getUsersInRoom, getUser, createChatRoom  }
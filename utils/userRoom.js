const RoomModel = require('../Models/ChatRooms');

 const createChatRoom = async (req, res) => {
     try {
        const { name } = req.body
        const hasChatRoom = await RoomModel.findOne({ name })
         if (hasChatRoom) res.send ("Chat Room Already Exists") 
         const chatRoom = new RoomModel({
             name
         })    
         await chatRoom.save()    
         res.send(chatRoom.name)
     } catch (error) {        
         console.log(error)
     }     
    
} 
 

const userEntry = async ({ room, username, id }) => {
    /* username = username.trim().toLowerCase();
    room = room.trim().toLowerCase(); */
    if (!username || !room) {
        return {
          error: "Username and room are required!",
        }
      }
    try {
        // check if user already there
        const user = await RoomModel.findOne({
            name: room,
            "members.username": username,
        })
        console.log(user)
        // changing user id if already exists
        if (user) {
            await RoomModel.findOneAndUpdate(
                { name: room, "members.username": username},
                { "members.$.id": id}
            )
        } else {
            // Otherwise we are gonna add him to the members array
            await RoomModel.findOneAndUpdate(
                { name: room },
                { $addToSet: { members: {username, id}}}
            )
        }
        return { username, room}
    } catch (error) {
        console.log(error)
        return error       
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

const removeUser = async (id, room) => {
    try {
      const foundRoom = await RoomModel.findOne({ name: room })
  
      const username = foundRoom.members.find((member) => member.id === id)
  
      await RoomModel.findOneAndUpdate(
        { name: room },
        {
          $pull: { members: { id: id } },
        }
      )
  
      return username
    } catch (error) {
      console.log(error)
    }
  }

module.exports = { userEntry, getUsersInRoom, getUser, createChatRoom, removeUser  }
const ChatRooms = require('../Models/ChatRooms');

const createChatRoom = async (req, res) => {
  try {
    const { name, image, description } = req.body
    const hasChatRoom = await ChatRooms.findOne({ name })
    if (hasChatRoom) res.send("Chat Room Already Exists")
    const chatRoom = new ChatRooms({
      name,
      image,
      description
    })
    await chatRoom.save()
    res.send(chatRoom)
  } catch (error) {
    console.log(error)
  }

}


const userEntry = async ({ room, username, id }) => {
  /* username = username.trim().toLowerCase();
  room = room.trim().toLowerCase(); */
  console.log('----------------------------, ', id)
  console.log('----------------------------, ', username)
  console.log('------------------------------ ', room)
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    }
  }
  try {
    // check if user already there
    const user = await ChatRooms.findOne({
      name: room,
      "members.username": username,
    })
    console.log('********************** ', user)
    // changing user id if already exists
    if (user) {
      await ChatRooms.findOneAndUpdate(
        { name: room, "members.username": username },
        { "members.$.id": id }
      )
    } else {
      // Otherwise we are gonna add him to the members array
      const user = await ChatRooms.findOneAndUpdate(
        { name: room },
        {
          $addToSet: { members: { username, id } },
        }
      )

    }

    return { username, room }
    //return room
  } catch (error) {
    console.log(error)
    return error
  }
}
const getUser = async (roomName, id) => {
  try {
    const room = await ChatRooms.findOne({ name: roomName })
    const user = room.members.find((member) => member.id === id)
    return user
  } catch (error) {
    console.log(error)

  }
}

const getUsersInRoom = async (roomName) => {
  try {
    const room = await ChatRooms.findOne({ name: roomName })

    return room.members
  } catch (error) {
    console.log(error)
  }

}

const removeUser = async (id, room) => {
  try {
    const foundRoom = await ChatRooms.findOne({ name: room })

    const username = foundRoom.members.find((member) => member.id === id)

    await ChatRooms.findOneAndUpdate(
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

module.exports = { userEntry, getUsersInRoom, getUser, createChatRoom, removeUser }
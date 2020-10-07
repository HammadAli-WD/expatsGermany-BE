const RoomModel = require('./schema');

const userEntry = async ({ roomName, username, id }) => {
    try {
        // check if user already there
        const user = await RoomModel.findOne({
            name: roomName,
            "members.username": username,
        })

        // changing user id if already exists
        if (user) {
            await RoomModel.findOneAndUpdate(
                { name: roomName, "members.username": username}
            )
        } else {
            // Otherwise we are gonna add him to the members array
            await RoomModel.findOneAndUpdate(
                { name:roomName },
                { $addToSet: { members: {username, id}}}
            )
        }
        return { username, roomName}
    } catch (error) {
        console.log(error)       
    }
}

module.exports = { userEntry }
const router = require("express").Router();
const { createChatRoom } = require("../../utils/userRoom")
const {authorize, adminOnly} = require('../../middlewares/authorize')
const RoomModel = require('../../Models/ChatRooms')
router.post('/room', authorize, adminOnly, async (req, res, next) => {    
    try {
       await createChatRoom(req, res)
    } catch (error) {      
      console.log(error);
    }
   })

   router.get("/", authorize, async (req, res, next) => {
    try{
      //const ChatRoom = await RoomModel.findOne({ name })
        const ChatRoom = await RoomModel.find();
        res.status(200).send(ChatRoom);
            
    } catch (error) {
      next(error)
      console.log(error);
    }
})
/* 
router.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
}) */

module.exports = router
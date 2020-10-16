const router = require("express").Router();
const { createChatRoom } = require("../../utils/userRoom")
const {authorize, adminOnly} = require('../../middlewares/authorize')

router.post('/room', authorize, adminOnly, async (req, res, next) => {    
    try {
       await createChatRoom(req, res)
    } catch (error) {      
      console.log(error);
    }
   })
/* 
router.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
}) */

module.exports = router
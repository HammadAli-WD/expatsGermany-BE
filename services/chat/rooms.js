const router = require("express").Router();
const { createChatRoom } = require("../../utils/userRoom")
const authorize = require('../../middlewares/authorize')

router.post('/room', authorize, async (req, res, next) => {    
    try {
       await createChatRoom(req, res)
    } catch (err) {
        next(err)
      console.error(err);
    }
   })

   module.exports = router
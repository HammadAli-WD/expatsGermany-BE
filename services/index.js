require("dotenv").config();
const router = require("express").Router();
const userRouter = require("./user")
const passport = require('passport');

router.use(passport.initialize())
router.use("/user", userRouter)

module.exports = router
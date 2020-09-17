const router = require("express").Router()
const UserModel = require("./schema")
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const { authorize, authenticate } = require("passport");
const upload = multer({});

router.get("/", authorize, async (req, res, next) => {
    try{
        const users = await UserModel.find();
        if (users.length < 1) {            
            res.status(200).send("User List is Empty")            
        } else {
            console.log(users);
            res.status(200).send(users);
        }          
    } catch (error) {
        next()
    }
})

router.get("/me", authorize, (req, res, next) => {
    try {
        res.send(req.user)
    } catch (error) {
        next(error)
    }
})

router.post("/Register", async (req, res, next) => {
    try {
        const newUser = new UserModel(obj);
        const { _id } = await newUser.save()
        res.status(201).send(_id)
    } catch (error) {
        next(error);
    }
})
 router.post("/signIn", async(req, res, next)=>{
     try {
         const { email, password} = req.body;
         const user = await UserModel.findByCredentials(email, password);
         const { token, refreshToken } = await authenticate(user);
         res.cookie("accessToken", token, {
            httpOnly: true,
            path: "/",
            sameSite: "none",
            secure: false,
         })
         res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
            sameSite: "none",
            secure: false,
          });
          res.status(200).send({ accessToken: token, refreshToken });
     } catch (error) {
        next(error);

     }
 })

 router.post("/signOut", authorize, async (req, res, next) => {
    try {
      req.user.refreshTokens = req.user.refreshTokens.filter(
        (t) => t.token !== req.body.refreshToken
      );
      await req.user.save();
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.send("You are succesfully Sign out from LinkedIn");
    } catch (err) {
      next(err);
    }
  });
  
router.post("/:id/upload", upload.single("image"), async (req, res, next) => {
    try {
        const imagesPath = path.join(__dirname, "./images");
        await fs.writeFile(
          path.join(
            imagesPath,
            req.params.id + "." + req.file.originalname.split(".").pop()  // pop is for type of image like .jpg etc
          ),
          req.file.buffer
        );
    
        //
        const obj = {
          image: fs.readFileSync(
            path.join(
              __dirname +
                "/images/" +
                req.params.id +
                "." +
                req.file.originalname.split(".").pop()
            )
          ),
        };
        //
        const update = await UserModel.findByIdAndUpdate(req.params.id, obj);
        console.log(update)
      
    } catch (error) {
        next(error)
    }
    res.send("Ok");

})
module.exports = router
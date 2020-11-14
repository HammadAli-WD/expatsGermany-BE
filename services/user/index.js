const router = require("express").Router()
const UserModel = require("../../Models/User")
const multer = require("multer");
const fs = require("fs-extra");
const path = require("path");
const { authorize } = require('../../middlewares/authorize')
const upload = multer({});
const { authenticate, refreshToken } = require('../../utils/jwtAuth')
const passport = require('../../utils/oauth')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get("/", authorize, async (req, res, next) => {
  try {
    const users = await UserModel.find();
    if (users.length < 1) {
      res.status(200).send("User List is Empty")
    } else {
      console.log(users);
      res.status(200).send(users);
    }
  } catch (error) {
    next(error)
    console.log(error);
  }
})

router.get("/me", authorize, (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next(error)
    console.log(error);
  }
})

router.post("/Register", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save()
    res.status(201).send(_id)
  } catch (error) {
    next(error)
    console.log(error);
  }
})
router.post("/signIn", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByCredentials(email, password);


    const { token, refreshToken } = await authenticate(user);
    res.cookie("accessToken", token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    if (!user) {
      const err = new Error("Not Found")
      err.httpStatusCode = 404
      throw err
    }
    res.status(200).send({ accessToken: token, refreshToken });
  } catch (error) {
    next(error)
  }
})

router.post("/signOut", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = await req.user.refreshTokens.filter(
      (t) => t.token !== req.body.refreshToken
    );
    //await req.user.save();
    await res.clearCookie("accessToken");
    await res.clearCookie("refreshToken");
    res.send("You are succesfully Sign out from the App");
  } catch (error) {
    next(error)
    console.log(error);
  }
});

router.post("/:username/upload", upload.single("profile"), async (req, res, next) => {
  try {
    if (req.file) {
      const imageUsername = req.params.username
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'profiles',
          public_id: imageUsername,
        },
        async (err, result) => {
          if (!err) {

            const post = new UserModel({
              image: req.body.image
            });

            await post.save({ validateBeforeSave: false })
            res.status(200).send('Image Uploaded');
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream)
    } else {
      const err = new Error();
      err.httpStatusCode = 400;
      err.message = 'Image file missing'
      next(err)
    }

  } catch (error) {
    next(error)
    console.log(error);
  }
})

router.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 403;
    next(err);
  } else {
    try {
      const tokens = await refreshToken(oldRefreshToken);

      res.cookie("accessToken", tokens.token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.send(tokens);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
});

// Modify a profile
router.put("/", authorize, async (req, res, next) => {
  try {
    const profile = await UserModel.findOneAndUpdate(req.user._id, req.body);
    if (profile) {
      res.status(200).send("OK");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {

    next(error)
    console.log(error);
  }
});

// Delete a profile
router.delete("/", async (req, res, next) => {
  try {
    const profile = await UserModel.findByIdAndDelete(req.user._id);
    if (profile) {
      res.status(200).send("Delete!");
    } else {
      const error = new Error(`Profile with id ${req.params.id} not found!`);
      next(error);
    }
  } catch (error) {
    next(error)
    console.log(error);
  }
});
router.get(
  "/auth/fbSignIn",
  passport.authenticate('facebook')
)
router.get(
  "/auth/fbSignIn/redirect",
  passport.authenticate("facebook"),
  async (req, res, next) => {
    try {
      console.log('Tokensssss', req.user)
      const { token, refreshToken } = await req.user
      await res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      await res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.status(200).redirect(process.env.REDIRECT_CHATROOM)
    } catch (error) {
      next(error)
      console.log(error);

    }
  }
)

router.get(
  "/auth/LinkedIn",
  passport.authenticate('linkedin')
)
router.get(
  "/auth/LinkedIn/redirect",
  passport.authenticate("linkedin"),
  async (req, res, next) => {
    try {
      console.log(req.user)
      const { token, refreshToken } = await req.user
      res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.status(200).redirect(process.env.REDIRECT_CHATROOM)
    } catch (error) {
      console.log(error)
      next(error)
      console.log(error);

    }
  }
)

module.exports = router
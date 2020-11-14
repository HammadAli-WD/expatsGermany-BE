const passport = require("passport");
const { Strategy } = require("passport-facebook");
const { authenticate } = require("./jwtAuth");
const UserModel = require("../Models/User");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;

passport.use(
  new Strategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `https://apiexpatsingermany.herokuapp.com/user/auth/fbSignIn/redirect`,
      profileFields: ['id', 'email', 'gender', "first_name", "last_name", "picture.type(large)"]

    },

    async (accessToken, refreshToken, profile, done) => {
      const { email, first_name, last_name, id } = profile._json;
      const newUser = {
        facebookId: id,
        name: first_name,
        surname: last_name,
        username: last_name,
        email: email,
        password: id,
        image: `https://graph.facebook.com/${profile.id}/picture?width=200&height=200&access_token=${accessToken}`,
        //role: "user",        
        refreshTokens: [],
      }
      console.log(profile._json);
      console.log(newUser);
      try {
        const user = await UserModel.findOne({ facebookId: id })

        if (user) {
          const tokens = await authenticate(user)
          done(null, { user, tokens })
        } else {
          let createdUser = await UserModel.create(newUser)

          const tokens = await authenticate(createdUser)
          console.log("User Created", createdUser)
          done(null, { user, tokens })
        }
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
)

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_APP_ID,
      clientSecret: process.env.LINKEDIN_APP_SECRET,
      callbackURL: `https://apiexpatsingermany.herokuapp.com/user/auth/LinkedIn/redirect`,
      scope: ["r_liteprofile", "r_emailaddress"],

    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('PROFILE', profile);
      const newUser = {
        LinkedInId: profile.id,
        name: profile.name.givenName,
        surname: profile.name.familyName,
        email: profile.emails[0].value,
        username: profile.name.familyName,
        image: profile.photos[0].value,
        //role: "user",
        password: profile.id,
        refreshTokens: [],
      }
      console.log('New user-', newUser)
      try {
        const user = await UserModel.findOne({ LinkedInId: profile.id })
        if (user) {
          const tokens = await authenticate(user)
          done(null, { user, tokens })
        } else {
          let createdUser = await UserModel.create(newUser)
          const tokens = await authenticate(createdUser)
          done(null, { user, tokens })
        }
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})


module.exports = passport;
const { Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validation = require("validator");

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        }, 
        surname: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            /* validate: {
              validator: async (value) => {
                const checkUsername = await UserModel.findOne({ username: value });
                if (checkUsername) {
                  throw new Error('Username already exists!');
                }
              },
            }, */
          },
        password: {
            type: String,
            required: true,            
        },
        image: {
            type: Schema.Types.Mixed
        },
        email: {
            type: String,
            required: true,
            validate: {
              validator: async (value) => {
                if (!validation.isEmail(value)) {
                  throw new Error('Email is invalid');
                } else {
                  const checkEmail = await UserModel.findOne({ email: value });
                  if (checkEmail) {
                    throw new Error('Email already existsts');
                  }
                }
              },
            },
          },
        refreshTokens: [
        {
            token: {
            type: String,
            required: true,
            },
        },
        ],
        facebookId: String,
        LinkedInId: String,
        role: {
            type: String,
            enum: ["admin"],            
        }
    },
    { timestamps: true }
);

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.__v;

    return userObject
};

UserSchema.statics.findByCredentials = async (loginCredential, password) => {
    try {
    const user = await UserModel.findOne({
        $or: [{ username: loginCredential }, { email: loginCredential }],
    });
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        const err = new Error ("Unable to match the credentials")
        err.httpStatusCode = 401;
        throw err;
    }
    return user;
    } catch (error) {
        const err = new Error("Not Found")
        err.httpStatusCode = 404;
        throw err
    }
    
};

UserSchema.pre("save", async function(next){
    const user = this;

    if (user.isModified("password")){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next()
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
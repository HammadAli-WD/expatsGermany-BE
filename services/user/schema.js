const { Schema } = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const v = require("validator");

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
            lowercase: true,
            unique: false,
            validate: {
              validator: async (value) => {
                if (!v.isEmail(value)) {
                  throw new Error("Email pattern is invalid");
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
        LinkedInId: String
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

UserSchema.statics.findByCredentials = async (email, password) => {
    try {
    const user = await UserModel.findOne({email});
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
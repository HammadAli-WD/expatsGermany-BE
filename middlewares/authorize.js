const jwt = require("jsonwebtoken");
const UserModel = require("../services/user/schema");
const { verifyJWT } = require("../utils/jwtAuth");

const authorize = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;

        if(token) {
            const decoded = await verifyJWT(token);
            console.log(decoded)
            const user = await UserModel.findOne({
                _id: decoded._id
            });
            if(!user) {
                throw new Error("No user Found")
            }
            req.token = token;
            req.user = user;
            next();
        } else {
            next("Token is missing in cookies!")
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
};

module.exports = authorize
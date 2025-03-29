const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "userinfodb")
const userinfodb = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    serverSelectionTimeoutMS: 5000
})

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profile_photo: {
        type: String,
        required: true
    }
})

let UserInfo = userinfodb.model("UserInfo", userSchema)

module.exports = UserInfo;
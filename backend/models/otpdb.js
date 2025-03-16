const mongoose = require('mongoose')
const { type } = require('os')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "otpdb")
const otpdb = mongoose.createConnection(mongoURI)

let otpSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    otp: {
        type: Number
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 300 }
    },
    profile_photo: {
        type: String
    }
})

let Otp = otpdb.model("Otp", otpSchema)

module.exports = Otp
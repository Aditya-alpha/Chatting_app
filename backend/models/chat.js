const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "chatdb")
const chatdb = mongoose.createConnection(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tls: true,
    serverSelectionTimeoutMS: 5000
})

const getISTDate = () => {
    let now = new Date()
    let istOffset = 5.5 * 60 * 60 * 1000
    return new Date(now.getTime() + istOffset)
}

let chatSchema = new mongoose.Schema({
    to: {
        type: String
    },
    from: {
        type: String
    },
    text: {
        message: {
            type: String
        },
        sentDate: {
            type: Date,
            default: Date.now
        }
    },
    files: [
        {
            fileName: String,
            fileUrl: String,
            uploadDate: {
                type: Date,
                default: getISTDate
            }
        }
    ],
    date: {
        type: Date,
        default: getISTDate
    }
})

let Chat = chatdb.model("Chat", chatSchema)

module.exports = Chat
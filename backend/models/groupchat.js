const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "groupchatdb")
const groupchatdb = mongoose.createConnection(mongoURI)

const getISTDate = () => {
    let now = new Date()
    let istOffset = 5.5 * 60 * 60 * 1000
    return new Date(now.getTime() + istOffset)
}

let groupchatSchema = new mongoose.Schema({
    groupName: {
        type: String
    },
    from: {
        type: String
    },
    text: {
        type: String,
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

let GroupChat = groupchatdb.model("GroupChat", groupchatSchema)

module.exports = GroupChat
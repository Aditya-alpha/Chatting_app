const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "groupsdb")
const groupsdb = mongoose.createConnection(mongoURI)

const getISTDate = () => {
    let now = new Date()
    let istOffset = 5.5 * 60 * 60 * 1000
    return new Date(now.getTime() + istOffset)
}

let groupsSchema = new mongoose.Schema({
    groupName: {
        type: String
    },
    members: {
        type: Array
    },
    sender: {
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

let Groups = groupsdb.model("Groups", groupsSchema)

module.exports = Groups
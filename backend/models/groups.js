const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "groupsdb")
const groupsdb = mongoose.createConnection(mongoURI, {
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

let groupsSchema = new mongoose.Schema({
    groupName: {
        type: String
    },
    members: {
        type: Array
    },
    text: {
        type: String,
        sentDate: {
            type: Date,
            default: Date.now
        }
    },
    group_photo: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: getISTDate
    }
})

let Groups = groupsdb.model("Groups", groupsSchema)

module.exports = Groups
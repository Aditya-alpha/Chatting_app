const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "filesdb")
const filesdb = mongoose.createConnection(mongoURI)

let FileSchema = new mongoose.Schema({
    username: {
        type: String
    },
    files: [
        {
            fileName: String,
            fileUrl: String,
            uploadDate: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

let Files = filesdb.model("Files", FileSchema)

module.exports = Files
const mongoose = require('mongoose')
require('dotenv').config()

const mongoURI = process.env.MONGODB_URI.replace("<db_name>", "allchatdb")
const allchatdb = mongoose.createConnection(mongoURI)


allchatdb.on("connected", () => console.log("Connected to MongoDB: allchatdb"));
allchatdb.on("error", (err) => console.error("MongoDB connection error:", err));

let allchatchema = new mongoose.Schema({
    username: {
        type: String
    },
    text: {
        message: String,
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
                default: Date.now
            }
        }
    ]
})

let AllChat = allchatdb.model("AllChat", allchatchema)

module.exports = AllChat
const express = require('express')
const cors = require('cors')
const UserInfo = require("./models/userinfo")
const Otp = require("./models/otpdb")
const Files = require("./models/files")
const AllChat = require("./models/allchat")
const Chat = require("./models/chat")
const Groups = require("./models/groups")
const GroupChat = require("./models/groupchat")
const sendEmail = require("./email/email")
const bcrypt = require('bcrypt')
const multer = require('multer')
const cloudinary = require("./uploadfiles")
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { Server } = require('socket.io')
const { createServer } = require('http')

const app = express()

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    }
})

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
    credentials: true
}

const PORT = process.env.PORT

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'posts',
        allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'pdf', 'zip', 'txt'],
        resource_type: 'auto'
    },
});

const upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 1024 } })

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors(corsOptions))

let users = {}

io.on("connection", (socket) => {
    socket.on("userRegister", (username) => {
        users[username] = socket.id
    })
})

app.get("/", () => {
    console.log("Hello")
})

app.post("/signup", async (req, res) => {
    let { username, email, password, profile_photo } = req.body
    try {
        let isUser = await UserInfo.findOne({ $or: [{ username: username }, { email: email }] })
        if (isUser) {
            if (isUser.username === username) {
                res.status(408).send({ "message": "Username already exists." })
                return
            }
            if (isUser.email === email) {
                res.status(409).send({ "message": "Email already in use. You can login using this email" })
                return
            }
        }
        let otp = Math.floor(100000 + Math.random() * 900000)
        await sendEmail(email, otp)
        let hashedPassword = await bcrypt.hash(password, 10)
        await Otp.findOneAndUpdate({ email: email }, { username: username, email: email, password: hashedPassword, otp: otp, profile_photo: profile_photo }, { upsert: true, new: true })
        return res.status(200).json("Success")
    }
    catch (error) {
        return res.status(500).json("Internal server error")
    }
})

app.post("/signup/otp", async (req, res) => {
    let { email, enteredotp } = req.body
    try {
        let otpdata = await Otp.findOne({ email: email })
        if (otpdata.otp === parseInt(enteredotp)) {
            let data = await UserInfo.create({
                username: otpdata.username,
                email: otpdata.email,
                password: otpdata.password,
                profile_photo: otpdata.profile_photo
            })
            await Otp.deleteOne({ email })
            res.status(200).send(data)
        }
        else {
            res.status(403).send("Incorrect OTP")
        }
    }
    catch (error) {
        res.send("Internal server error")
    }
})

app.post("/signup/resend-otp", async (req, res) => {
    let { email } = req.body;
    try {
        let otpData = await Otp.findOne({ email: email })
        if (!otpData) {
            return res.status(404).send({ message: "No OTP request found for this email. Please sign up again." })
        }
        let otpsent = Math.floor(100000 + Math.random() * 900000)
        await sendEmail(email, otpsent)
        await Otp.findOneAndUpdate(
            { email: email },
            { otp: otpsent, createdAt: new Date() },
            { new: true }
        )
        res.status(200).send({ message: "New OTP sent successfully" })
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.post("/signin", async (req, res) => {
    let { email, password } = req.body
    try {
        let isUser = await UserInfo.findOne({ email })
        if (!isUser) {
            return res.status(404).send({ message: "User not found" })
        }
        const isPasswordValid = await bcrypt.compare(password, isUser.password);
        if (!isPasswordValid) {
            return res.status(403).send({ message: "Password is incorrect" });
        }
        return res.status(200).send(isUser)
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.post("/signin/forgotpassword", async (req, res) => {
    let { email } = req.body
    try {
        let otpsent = Math.floor(100000 + Math.random() * 900000)
        await sendEmail(email, otpsent)
        await Otp.findOneAndUpdate({ email: email }, { email: email, otp: otpsent }, { upsert: true, new: true })
        res.status(200).send("Email sent")
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.post("/signin/forgotpassword/verify", async (req, res) => {
    let { email, enteredotp } = req.body
    try {
        let otpdata = await Otp.findOne({ email: email })
        if (otpdata.otp === parseInt(enteredotp)) {
            await Otp.deleteOne({ email })
            res.status(200).send("Otp verified")
        }
        else {
            res.status(403).send("Incorrect OTP")
        }
    }
    catch (error) {
        res.send("Internal server error")
    }
})

app.post("/signin/updatepassword", async (req, res) => {
    const newPassword = req.body.newPassword
    const email = req.body.email
    try {
        let userData = await UserInfo.findOne({ email: email })
        if (userData) {
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await UserInfo.findOneAndUpdate({ email: email }, { $set: { password: hashedPassword } }, { new: true })
            res.status(200).send("Password updated successfully")
        }
        else {
            res.status(403).send("User not found")
        }
    }
    catch (error) {
        res.send("Internal server error")
    }
})

app.post("/:username/upload", upload.array("files", Infinity), async (req, res) => {
    let { username } = req.params
    try {
        let files = req.files.map(file => ({
            fileName: file.originalname,
            fileUrl: file.path,
            uploadDate: new Date()
        }))
        let userData = await Files.find({ username })
        let allDocs = userData.flatMap(doc => doc.files)
        let userFiles = allDocs.map(file => file.fileName)
        let isAlready = files.some(file => userFiles.includes(file.fileName))
        if (!isAlready) {
            let mainData = await Files.create({
                username: username,
                files: files
            })
            res.status(200).send(mainData)
        }
        else {
            res.status(400).send({ message: "File already exists !" })
        }
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.get("/:username/gallery", async (req, res) => {
    let { username } = req.params
    try {
        let mainData = await Files.find({ username })
        res.status(200).send(mainData)
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.delete("/:username/delete", async (req, res) => {
    try {
        let { username } = req.params
        let { fileName } = req.body
        if (!fileName) {
            return res.status(400).json({ message: "File name is required" })
        }
        let userFiles = await Files.find({ username })
        if (!userFiles.length) {
            return res.status(404).json({ message: "User not found" })
        }
        let updated = false
        for (let doc of userFiles) {
            let originalLength = doc.files.length
            doc.files = doc.files.filter(file => file.fileName !== fileName)
            if (doc.files.length === 0) {
                await Files.deleteOne({ _id: doc._id })
                updated = true
            } else if (doc.files.length !== originalLength) {
                await doc.save()
                updated = true
            }
        }
        if (updated) {
            return res.json({ message: "File deleted successfully, and empty documents removed" })
        } else {
            return res.status(404).json({ message: "File not found in any document" })
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting file", error })
    }
})

app.post("/:username/allchat", upload.array("files", Infinity), async (req, res) => {
    let { username } = req.params
    try {
        let message = req.body.message
        let files = req.files.map(file => ({
            fileName: file.originalname,
            fileUrl: file.path,
            uploadDate: new Date()
        }))
        let mainData = await AllChat.create({
            username: username,
            text: {
                message: message,
                sentDate: new Date()
            },
            files: files
        })
        let user = await UserInfo.findOne({ username: username }, "profile_photo")
        let messageWithPhoto = {
            ...mainData.toObject(),
            profile_photo: user.profile_photo
        }
        io.emit("newMessage", messageWithPhoto)
        res.status(200).send(messageWithPhoto)
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
        console.log(error)
    }
})

app.get("/:username/allchat", async (req, res) => {
    try {
        let data = await AllChat.find({})
        let fullData = await Promise.all(
            data.map(async (chat) => {
                let profilePhotos = await UserInfo.findOne({ username: chat.username }, "profile_photo")
                return {
                    ...chat.toObject(),
                    profile_photo: profilePhotos.profile_photo
                }
            }))
        res.status(200).send(fullData)
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.get("/:username/profile", async (req, res) => {
    let { username } = req.params
    try {
        let data = await UserInfo.findOne({ username })
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.post("/:username/profile", upload.single("profile_photo"), async (req, res) => {
    let { username } = req.params
    let profile_photo = req.file.path
    try {
        let data = await UserInfo.findOneAndUpdate({ username }, { profile_photo }, { new: true })
        io.emit("updateProfile", data)
        res.status(200).send(data)
    }
    catch (error) {
        res.status(500).send({ message: "Internal server error" })
    }
})

app.post("/:username/profile/updatepassword", async (req, res) => {
    let { username } = req.params
    let oldpassword = req.body.oldPassword
    let newpassword = req.body.newPassword
    try {
        let userData = await UserInfo.findOne({ username: username })
        if (!userData) {
            return res.status(404).send({ message: "User not found." });
        }
        const isPasswordValid = await bcrypt.compare(oldpassword, userData.password);
        if (!isPasswordValid) {
            return res.status(403).send({ message: "Old password is incorrect." });
        }
        const hashedNewPassword = await bcrypt.hash(newpassword, 10)
        await UserInfo.findOneAndUpdate({ username: username }, { password: hashedNewPassword }, { new: true })
        res.status(200).send({ message: "Password updated successfully." })

    }
    catch (error) {
        res.status(500).send({ message: "Internal server error. Please try again later." })
    }
})

app.post("/:username/chat", upload.array("files", Infinity), async (req, res) => {
    let { username } = req.params
    let { type, search, to, message } = req.body
    if (type === "user") {
        try {
            let user = await UserInfo.find({ username: search })
            if (user) {
                res.status(200).send(user)
            }
        }
        catch (error) {
            res.status(500).send({ message: "Internal server error. Please try again later." })
        }
    }
    else if (type === "fetch") {
        try {
            let user = await UserInfo.findOne({ username: to })
            let chats = await Chat.find({ $or: [{ from: username, to: to }, { from: to, to: username }] })
            let fullChat = await Promise.all(
                chats.map(async (chat) => {
                    let profilePhotos = await UserInfo.findOne({ username: chat.from }, "profile_photo")
                    return {
                        ...chat.toObject(),
                        profile_photo: profilePhotos.profile_photo,
                        to_profile_photo: user.profile_photo
                    }
                }))
            res.status(200).send(fullChat)
        }
        catch (error) {
            res.status(500).send({ message: "Internal server error. Please try again later." })
        }
    }
    else {
        try {
            let files = req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path,
                uploadDate: new Date()
            }))
            let chatMessage = await Chat.create({
                to: to,
                from: username,
                text: {
                    message: message,
                    sentDate: new Date()
                },
                files: files
            })
            if (chatMessage) {
                let user = await UserInfo.findOne({ username: username }, "profile_photo")
                let receiver = await UserInfo.findOne({ username: to })
                let messageWithPhoto = {
                    ...chatMessage.toObject(),
                    profile_photo: user.profile_photo,
                    to_profile_photo: receiver.profile_photo
                }
                let receiverId = users[to]
                let senderId = users[username]
                io.to(receiverId).to(senderId).emit("freshChatList", messageWithPhoto)
                res.status(200).send(messageWithPhoto)
            }
        }
        catch (error) {
            res.status(500).send({ message: "Internal server error. Please try again later." })
        }
    }
})

app.get("/:username/chat", async (req, res) => {
    let { username } = req.params
    try {
            let data = await Chat.find({ $or: [{ from: username }, { to: username }] })
            let senders = [...new Set(data.map(msg => msg.from))]
            let senderProfiles = await UserInfo.find({ username: { $in: senders } }, "username profile_photo")
            let receivers = [...new Set(data.map(msg => msg.to))]
            let receiverProfiles = await UserInfo.find({ username: { $in: receivers } }, "username profile_photo")
            let fullData = data.map(msg => {
                let senderProfile = senderProfiles.find(profile => profile.username === msg.from)
                let receiverProfile = receiverProfiles.find(profile => profile.username === msg.to)
                return {
                ...msg.toObject(),
                profile_photo: senderProfile.profile_photo,
                to_profile_photo: receiverProfile.profile_photo
            }})
            res.status(200).send(fullData)
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Internal server error" })
    }
})

app.post("/:username/groups", upload.array("files", Infinity), async (req, res) => {
    let { username } = req.params
    let { type, member, groupName, members } = req.body
    let allmembers = Array.isArray(members) ? [...members, username] : [username]
    if (type === "member_search") {
        try {
            let isMember = await UserInfo.findOne({ username: member })
            if (isMember) {
                res.status(200).send(isMember)
            }
            else {
                return res.status(404).json({ message: "User not found" })
            }
        }
        catch (error) {
            res.status(500).send({ message: "Internal server error" })
        }
    }
    else if (type === "create_group") {
        try {
            let group = await Groups.create({ groupName, members: allmembers })
            if (group) {
                res.status(200).send(group)
            }
        }
        catch (error) {
            res.status(500).send({ message: "Internal server error" })
        }
    }
    else if (type === "show") {
        try {
            let previousChat = await GroupChat.find({ groupName })
            if (previousChat) {
                res.status(200).send(previousChat)
            }
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ message: "Internal server error" })
        }
    }
    else {
        try {
            let files = req.files.map(file => ({
                fileName: file.originalname,
                fileUrl: file.path,
                uploadDate: new Date()
            }))
            let chat = await GroupChat.create({ groupName: req.body.selectedGroup, from: username, text: req.body.text, files })
            if (chat) {
                res.status(200).send(chat)
            }
        }
        catch (error) {
            console.log(error)
            res.status(500).send({ message: "Internal server error" })
        }
    }
})

app.get("/:username/groups", async (req, res) => {
    let { username } = req.params
    let groups = await Groups.find({ members: username })
    if (groups) {
        res.status(200).send(groups)
    }
})

server.listen(PORT, () => {
    console.log("Server is listening...")
})
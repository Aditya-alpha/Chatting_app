const nodemailer = require("nodemailer")
const { Verification_Email_Template } = require("./emailtemplate")
require("dotenv").config()

const emailUser = process.env.EMAIL_USER
const emailUserPassword = process.env.EMAIL_USER_PASSWORD

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: emailUser,
    pass: emailUserPassword,
  },
});

const sendEmail = async (email, otpsent) => {
    try {
        const info = await transporter.sendMail({
            from: `"ScoreVision" <${emailUser}>`,
            to: email,
            subject: "Complete your Signup process",
            text: "Complete your Signup process",
            html: Verification_Email_Template.replace("{verificationCode}", otpsent)
        })
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = sendEmail
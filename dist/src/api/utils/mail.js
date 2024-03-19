import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASSWORD || ''
    }
});
export async function sendMail(to, content, subject = '') {
    if (!to || !content) {
        return false;
    }
    const mailOptions = { from: process.env.MAIL_USER || '', to, subject, text: content };
    try {
        const result = await transporter.sendMail(mailOptions);
        return !!result.messageId;
    }
    catch (error) {
        console.log(error);
        return false;
    }
}

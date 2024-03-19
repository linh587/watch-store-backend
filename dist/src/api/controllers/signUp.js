import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import * as UserAccountService from "../services/userAccount.js";
import { uploadImage } from "../utils/storageImage.js";
dotenv.config();
export async function signUpUser(req, res) {
    if (!req.fields) {
        res.status(400).json("Unknown error");
        return;
    }
    const information = req.fields;
    if (req.files && req.files.avatarFile) {
        const avatarFile = Array.isArray(req.files.avatarFile)
            ? req.files.avatarFile[0]
            : req.files.avatarFile;
        information.avatar = await uploadImage(avatarFile.filepath);
    }
    const userAccountId = await UserAccountService.createAccount(information);
    if (userAccountId) {
        // const JWT_VERIFY_SECRET_KEY = process.env.JWT_VERIFY_SECRET_KEY || 'token'
        // const CLIENT_URL_FOR_VERIFY_MAIL = process.env.CLIENT_URL_FOR_VERIFY_MAIL || 'localhost:3000'
        // const tokenVerify = jwt.sign({ id: userAccountId }, JWT_VERIFY_SECRET_KEY)
        // const mailContent = `Truy cập liên kết này để xác thực email\n${CLIENT_URL_FOR_VERIFY_MAIL}/${tokenVerify}`
        // const mailSubject = 'Xác thực email'
        // const userMailAddress = information.email
        // sendMail(userMailAddress, mailContent, mailSubject)
        res.json("Need verify mail to finish!");
    }
    else {
        res.status(400).json("Create failure");
    }
}
export async function checkExistsEmail(req, res) {
    const email = req.body["email"];
    const existsPhone = await UserAccountService.checkExistsEmail(email);
    res.json(existsPhone);
}
export async function verifyUser(req, res) {
    const tokenVerify = req.params["token"];
    const JWT_VERIFY_SECRET_KEY = process.env.JWT_VERIFY_SECRET_KEY || "token";
    try {
        const jwtPayload = jwt.verify(tokenVerify, JWT_VERIFY_SECRET_KEY);
        const userId = String(jwtPayload["id"]) || "";
        if (!userId) {
            res.status(400).json("Not found user");
        }
        const success = await UserAccountService.verifyEmail(userId);
        if (success) {
            res.json("Verified");
        }
        else {
            res.json("Unverified");
        }
    }
    catch (error) {
        res.status(400).json("Invalid token");
    }
}

import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
export function authorizationAdmin(req, res, next) {
    const accessToken = (req.headers.authorization || "").replace("Bearer ", "");
    if (accessToken) {
        try {
            const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
            const adminPayload = jwt.verify(accessToken, JWT_SECRET_KEY);
            // if (
            //   adminPayload.role !== "admin" ||
            //   adminPayload.username === "" ||
            //   adminPayload.type === ""
            // ) {
            //   res.status(403).json("Not permisson");
            //   return;
            // }
            req.username = adminPayload.username;
            req.adminType = adminPayload.type;
            next();
        }
        catch (error) {
            console.log(error.message);
            res.status(401).json("Access token invalid");
        }
    }
    else {
        res.status(400).json("Miss access token");
    }
}
export function authorizationUser(req, res, next) {
    const accessToken = (req.headers.authorization || "").replace("Bearer ", "");
    if (accessToken) {
        try {
            const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
            const userPayload = jwt.verify(accessToken, JWT_SECRET_KEY);
            //   if (userPayload.role !== "user") {
            //     res.status(403).json("Not permisson");
            //     return;
            //   }
            req.userAccountId = userPayload.id;
            next();
        }
        catch (error) {
            console.log(error.message);
            res.status(401).json("Access token invalid");
        }
    }
    else {
        res.status(400).json("Miss access token");
    }
}
export function authorizationStaff(req, res, next) {
    const accessToken = (req.headers.authorization || "").replace("Bearer ", "");
    if (accessToken) {
        try {
            const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
            const staffPayload = jwt.verify(accessToken, JWT_SECRET_KEY);
            // if (staffPayload.role !== "staff") {
            //   res.status(403).json("Not permisson");
            //   return;
            // }
            req.staffAccountId = staffPayload.id;
            next();
        }
        catch (error) {
            console.log(error.message);
            res.status(401).json("Access token invalid");
        }
    }
    else {
        res.status(400).json("Miss access token");
    }
}

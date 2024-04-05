import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { EXPIRE_TIME_OF_ACCESS_TOKEN, EXPIRE_TIME_OF_REFRESH_TOKEN, } from "../config.js";
dotenv.config();
export function refreshTokenForAdmin(req, res) {
    const refreshToken = String(req.body.refreshToken || "");
    try {
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
        const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "refresh";
        const adminPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
        const { username, type, role } = adminPayload;
        if (username && type && role === "admin") {
            const accessToken = jwt.sign({ username, type, role }, JWT_SECRET_KEY, {
                expiresIn: EXPIRE_TIME_OF_ACCESS_TOKEN,
            });
            const refreshToken = jwt.sign({ username, type, role }, JWT_REFRESH_SECRET_KEY, { expiresIn: EXPIRE_TIME_OF_REFRESH_TOKEN });
            res.json({ accessToken, refreshToken });
            return;
        }
        res.status(500).json("Error unknown");
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json("Refresh token invalid");
    }
}
export function refreshTokenForUser(req, res) {
    const refreshToken = String(req.body.refreshToken || "");
    try {
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
        const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "refresh";
        const userPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
        const { id, verified, role } = userPayload;
        if (id && role === "user") {
            const accessToken = jwt.sign({ id, verified, role }, JWT_SECRET_KEY, {
                expiresIn: EXPIRE_TIME_OF_ACCESS_TOKEN,
            });
            const refreshToken = jwt.sign({ id, verified, role }, JWT_REFRESH_SECRET_KEY, {
                expiresIn: EXPIRE_TIME_OF_ACCESS_TOKEN,
            });
            res.json({ accessToken, refreshToken });
            return;
        }
        res.status(500).json("Error unknown");
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json("Refresh token invalid");
    }
}
export async function refreshTokenForStaff(req, res) {
    const refreshToken = String(req.body.refreshToken || "");
    try {
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
        const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY || "refresh";
        const userPayload = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
        const { id, role } = userPayload;
        if (id && role === "staff") {
            const accessToken = jwt.sign({ id, role }, JWT_SECRET_KEY, {
                expiresIn: EXPIRE_TIME_OF_ACCESS_TOKEN,
            });
            const refreshToken = jwt.sign({ id, role }, JWT_REFRESH_SECRET_KEY, {
                expiresIn: EXPIRE_TIME_OF_ACCESS_TOKEN,
            });
            res.json({ accessToken, refreshToken });
            return;
        }
        res.status(500).json("Error unknown");
    }
    catch (error) {
        console.log(error.message);
        res.status(400).json("Refresh token invalid");
    }
}

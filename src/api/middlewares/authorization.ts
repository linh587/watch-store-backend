import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();

// override request inteface of express
export interface AdminRequest extends Request {
  username?: string;
  adminType?: string;
}

export interface UserRequest extends Request {
  userAccountId?: string;
}

export interface StaffRequest extends Request {
  staffAccountId?: string;
}

export function authorizationAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction
) {
  const accessToken = (req.headers.authorization || "").replace("Bearer ", "");

  if (accessToken) {
    try {
      const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
      const payload = jwt.verify(accessToken, JWT_SECRET_KEY) as JwtPayload;
      if (payload.role !== "admin" && payload.role !== "staff") {
        res.status(403).json("Not permisson");
        return;
      }

      req.username = payload.username;
      req.adminType = payload.type;

      next();
    } catch (error) {
      console.log((error as Error).message);
      res.status(401).json("Access token invalid");
    }
  } else {
    res.status(400).json("Miss access token");
  }
}

export function authorizationUser(
  req: UserRequest,
  res: Response,
  next: NextFunction
) {
  const accessToken = (req.headers.authorization || "").replace("Bearer ", "");

  if (accessToken) {
    try {
      const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
      const userPayload = jwt.verify(accessToken, JWT_SECRET_KEY) as JwtPayload;

      //   if (userPayload.role !== "user") {
      //     res.status(403).json("Not permisson");
      //     return;
      //   }
      req.userAccountId = userPayload.id;
      next();
    } catch (error) {
      console.log((error as Error).message);
      res.status(401).json("Access token invalid");
    }
  } else {
    res.status(400).json("Miss access token");
  }
}

export function authorizationStaff(
  req: StaffRequest,
  res: Response,
  next: NextFunction
) {
  const accessToken = (req.headers.authorization || "").replace("Bearer ", "");

  if (accessToken) {
    try {
      const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "token";
      const payload = jwt.verify(accessToken, JWT_SECRET_KEY) as JwtPayload;

      if (payload.role !== "staff" && payload.role !== "admin") {
        res.status(403).json("Not permisson");
        return;
      }
      req.staffAccountId = payload.id;
      next();
    } catch (error) {
      console.log((error as Error).message);
      res.status(401).json("Access token invalid");
    }
  } else {
    res.status(400).json("Miss access token");
  }
}

import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../config/db";

const auth = (...roles: ("admin" | "customer")[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          message: "You are not allowed",
        });
      }
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          message: "You are not allowed",
        });
      }
      const decoded = jwt.verify(
        token,
        config.auth_secret as string
      ) as JwtPayload;
      req.user = decoded as JwtPayload;

      const user = await pool.query(
        `
          SELECT * FROM users WHERE email=$1
        `,
        [decoded.email]
      );

      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({
          error: "forbidden",
        });
      }
      console.log(decoded);
      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export default auth;

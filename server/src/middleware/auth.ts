import { Request, Response, NextFunction } from "express";
import { extractToken, verifyToken, JwtPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ success: false, error: "Missing authentication token" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ success: false, error: "Invalid or expired token" });
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Authentication failed" });
  }
}

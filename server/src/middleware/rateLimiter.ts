import { Request, Response, NextFunction } from "express";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipCache = new Map<string, RateLimitInfo>();

export function rateLimiter(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const cachedInfo = ipCache.get(ip);

    if (!cachedInfo) {
      ipCache.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (now > cachedInfo.resetTime) {
      cachedInfo.count = 1;
      cachedInfo.resetTime = now + windowMs;
      return next();
    }

    cachedInfo.count += 1;
    if (cachedInfo.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Too many requests from this IP. Please try again later.",
      });
    }

    next();
  };
}

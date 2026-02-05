import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

type AuthPayload = {
  id: string;
  openid: string;
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] }) as AuthPayload;
    // @ts-ignore
    req.user = { id: decoded.id, openid: decoded.openid };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    // @ts-ignore
    const userId = req.user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("isAdmin").lean();
    if (!user?.isAdmin) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    next();
  })().catch(() => {
    res.status(500).json({ error: "Internal server error" });
  });
};

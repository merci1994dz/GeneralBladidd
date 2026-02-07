import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createDefaultAdmin() {
  try {
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      const hashedPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });
      console.log("✅ Default admin user created (username: admin, password: admin123)");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: "Authentication required" });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  db.select().from(users).where(eq(users.username, username))
    .then(async (result) => {
      if (result.length === 0) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = result[0];
      const isValid = await comparePassword(password, user.password);

      if (!isValid) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }

      req.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };

      next();
    })
    .catch((error) => {
      console.error("Auth error:", error);
      return res.status(500).json({ error: "Internal server error" });
    });
}

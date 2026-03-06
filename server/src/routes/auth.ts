import { Router, Request, Response } from "express";
import { User } from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    console.log("Register request received:", { name, email, passwordLength: password?.length });

    // Validation
    if (!name || !email || !password) {
      console.log("Missing fields:", { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    // Trim fields
    const trimmedName = String(name).trim();
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password);

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      console.log("Empty after trim");
      return res.status(400).json({
        success: false,
        error: "Name, email, and password cannot be empty",
      });
    }

    if (trimmedPassword.length < 8) {
      console.log("Password too short:", trimmedPassword.length);
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters",
      });
    }

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      console.log("Name invalid length:", trimmedName.length);
      return res.status(400).json({
        success: false,
        error: "Name must be 2-50 characters",
      });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.log("Invalid email format:", trimmedEmail);
      return res.status(400).json({
        success: false,
        error: "Please provide a valid email address",
      });
    }

    const user = await User.create(trimmedName, trimmedEmail, trimmedPassword);
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    console.log("User registered successfully:", user._id);
    console.log("Token generated, response includes:", { success: true, hasToken: !!token, user: User.formatResponse(user) });

    res.status(201).json({
      success: true,
      data: User.formatResponse(user),
      user: User.formatResponse(user),
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    console.error("Registration error:", message);
    res.status(400).json({ success: false, error: message });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const validPassword = await User.verifyPassword(user, password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    console.log("User logged in successfully:", user._id);
    console.log("Token generated, response includes:", { success: true, hasToken: !!token, user: User.formatResponse(user) });

    res.json({
      success: true,
      data: User.formatResponse(user),
      user: User.formatResponse(user),
      token,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    res.status(500).json({ success: false, error: message });
  }
});

// GET /api/auth/me
router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: User.formatResponse(user),
      user: User.formatResponse(user),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch user";
    res.status(500).json({ success: false, error: message });
  }
});

// POST /api/auth/logout
router.post("/logout", authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Logout failed";
    res.status(500).json({ success: false, error: message });
  }
});

export default router;

import express from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "../models/User.js";

const router = express.Router();

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

// POST /api/auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

  

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
   
    res.json({ message: "Logged out successfully" });
  }),
);

// GET /api/auth/me
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    // Note: In a real app, you'd use an authMiddleware to populate req.user
    // For now, we'll keep it simple or implement the middleware next.
    res.status(501).json({ message: "Use authMiddleware for /me" });
  }),
);

export default router;

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const userRepo = () => AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  console.log("Registering user:", { name, email }); // Debug log
  if (!name || !email || !password) {
    res.status(400).json({ message: "Name, email and password are required" });
    return;
  }

  const existing = await userRepo().findOne({ where: { email } });
  if (existing) {
    res.status(400).json({ message: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepo().create({ name, email, password: hashedPassword });
  await userRepo().save(user);

  res.status(201).json({ message: "User registered successfully" });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await userRepo().findOne({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await userRepo().save(user);

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token required" });
    return;
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepo().findOne({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    user.refreshToken = newRefreshToken;
    await userRepo().save(user);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const user = await userRepo().findOne({ where: { refreshToken } });
    if (user) {
      user.refreshToken = null;
      await userRepo().save(user);
    }
  }

  res.json({ message: "Logged out successfully" });
};

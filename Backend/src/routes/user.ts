import { Router } from "express";
import { getProfile, updateProfile, getAllUsers, updateUserStatus, deleteUser, createUser } from "../controllers/userController";

const router = Router();

// Profile Routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Admin Routes (User Management)
router.get("/all", getAllUsers);
router.post("/create", createUser);
router.patch("/:id/status", updateUserStatus);
router.delete("/:id", deleteUser);

export default router;

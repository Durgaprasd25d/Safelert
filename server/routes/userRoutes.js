import express from "express"
import { getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js"
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"

const router = express.Router()

// Admin routes
router.get("/", authenticateUser, authorizeAdmin, getAllUsers)
router.delete("/:id", authenticateUser, authorizeAdmin, deleteUser)

// User routes
router.get("/:id", authenticateUser, getUserById)
router.patch("/", authenticateUser, updateUser)

export default router

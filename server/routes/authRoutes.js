import express from "express"
import { register, login, updateLocation } from "../controllers/authController.js"
import { authenticateUser } from "../middleware/auth.js"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.patch("/update-location", authenticateUser, updateLocation)

export default router

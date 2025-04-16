import express from "express"
import {
  getAllAlerts,
  getAlertsByLocation,
  getAlertsByType,
  createAlert,
  updateAlert,
  deleteAlert,
} from "../controllers/alertController.js"
import { authenticateUser, authorizeAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/", getAllAlerts)
router.get("/location", getAlertsByLocation)
router.get("/type/:type", getAlertsByType)

// Protected routes
router.post("/", authenticateUser, authorizeAdmin, createAlert)
router.patch("/:id", authenticateUser, authorizeAdmin, updateAlert)
router.delete("/:id", authenticateUser, authorizeAdmin, deleteAlert)

export default router

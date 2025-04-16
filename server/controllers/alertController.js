import { DisasterAlert } from "../models/DisasterAlert.js"

// Get all alerts
export const getAllAlerts = async (req, res) => {
  try {
    const alerts = await DisasterAlert.find().sort({ timestamp: -1 })
    res.status(200).json(alerts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get alerts by location
export const getAlertsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" })
    }

    // Convert to numbers
    const userLat = Number.parseFloat(lat)
    const userLng = Number.parseFloat(lng)
    const searchRadius = Number.parseFloat(radius)

    // Get all alerts
    const allAlerts = await DisasterAlert.find().sort({ timestamp: -1 })

    // Filter alerts based on distance
    const nearbyAlerts = allAlerts.filter((alert) => {
      const distance = calculateDistance(userLat, userLng, alert.location.lat, alert.location.lng)
      return distance <= (alert.radius || searchRadius)
    })

    res.status(200).json(nearbyAlerts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get alerts by type
export const getAlertsByType = async (req, res) => {
  try {
    const { type } = req.params
    const alerts = await DisasterAlert.find({ type }).sort({ timestamp: -1 })
    res.status(200).json(alerts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create a new alert
export const createAlert = async (req, res) => {
  try {
    const { userId } = req.user
    const newAlert = new DisasterAlert({
      ...req.body,
      createdBy: userId,
    })

    // Generate safety tips if not provided
    if (!req.body.tips || req.body.tips.length === 0) {
      newAlert.tips = newAlert.generateSafetyTips()
    }

    await newAlert.save()
    res.status(201).json(newAlert)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update an alert
export const updateAlert = async (req, res) => {
  try {
    const { id } = req.params
    const alert = await DisasterAlert.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" })
    }

    res.status(200).json(alert)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete an alert
export const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params
    const alert = await DisasterAlert.findByIdAndDelete(id)

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" })
    }

    res.status(200).json({ message: "Alert deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

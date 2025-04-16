import { User } from "../models/User.js"

// Register User
export const register = async (req, res) => {
  try {
    const user = await User.create({ ...req.body })
    const token = user.createJWT()
    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      token,
    })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

// Login User
export const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = user.createJWT()
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
      token,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update user location
export const updateLocation = async (req, res) => {
  const { userId } = req.user
  const { city, state, lat, lng } = req.body

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { location: { city, state, lat, lng } },
      { new: true, runValidators: true },
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

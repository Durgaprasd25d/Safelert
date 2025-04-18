import jwt from "jsonwebtoken"

export const authenticateUser = async (req, res, next) => {
  // Check header
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication invalid" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // Attach the user to the request object
    req.user = { userId: payload.userId, name: payload.name, role: payload.role }
    next()
  } catch (error) {
    return res.status(401).json({ message: "Authentication invalid" })
  }
}

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized to access this route" })
  }
  next()
}

import { DisasterAlert } from "./models/DisasterAlert.js"
import { User } from "./models/User.js"

export async function seedDatabase() {
  try {
    // Check if we already have data
    const alertCount = await DisasterAlert.countDocuments()
    const userCount = await User.countDocuments()

    if (alertCount > 0 && userCount > 0) {
      console.log("Database already has data, skipping seed")
      return
    }

    console.log("Seeding database with mock data...")

    // Create admin user if it doesn't exist
    let adminUser = await User.findOne({ role: "admin" })

    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      })
      console.log("Admin user created")
    }

    // Create regular user if it doesn't exist
    let regularUser = await User.findOne({ role: "user" })

    if (!regularUser) {
      regularUser = await User.create({
        name: "Regular User",
        email: "user@example.com",
        password: "user123",
        role: "user",
        location: {
          city: "Bhubaneswar",
          state: "Odisha",
          lat: 20.296059,
          lng: 85.824539,
        },
      })
      console.log("Regular user created")
    }

    if (alertCount === 0) {
      const mockAlerts = [
        {
          type: "Flood",
          severity: "High",
          location: {
            city: "Bhubaneswar",
            state: "Odisha",
            lat: 20.296059,
            lng: 85.824539,
          },
          timestamp: new Date(),
          tips: [
            "Move to higher ground immediately",
            "Avoid walking or driving through flood waters",
            "Stay away from power lines and electrical wires",
            "Evacuate if told to do so",
            "Turn off utilities at the main switches if instructed",
          ],
          radius: 30,
          createdBy: adminUser._id,
        },
        {
          type: "Cyclone",
          severity: "High",
          location: {
            city: "Puri",
            state: "Odisha",
            lat: 19.8133,
            lng: 85.8314,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          tips: [
            "Stay indoors and away from windows",
            "Listen to emergency broadcasts",
            "Prepare emergency supplies",
            "Evacuate if directed by authorities",
            "Secure loose objects outside your home",
          ],
          radius: 50,
          createdBy: adminUser._id,
        },
        {
          type: "Earthquake",
          severity: "Medium",
          location: {
            city: "Delhi",
            state: "Delhi",
            lat: 28.7041,
            lng: 77.1025,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          tips: [
            "Drop, cover, and hold on",
            "Stay away from windows and exterior walls",
            "If outdoors, stay in open areas away from buildings",
            "Be prepared for aftershocks",
            "Check for gas leaks after the shaking stops",
          ],
          radius: 40,
          createdBy: adminUser._id,
        },
        {
          type: "Wildfire",
          severity: "Medium",
          location: {
            city: "Dehradun",
            state: "Uttarakhand",
            lat: 30.3165,
            lng: 78.0322,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          tips: [
            "Stay tuned to emergency alerts",
            "Keep doors and windows closed",
            "Have evacuation plans ready",
            "Wear protective clothing if outside",
            "Keep a fire extinguisher handy",
          ],
          radius: 25,
          createdBy: adminUser._id,
        },
        {
          type: "Flood",
          severity: "Low",
          location: {
            city: "Mumbai",
            state: "Maharashtra",
            lat: 19.076,
            lng: 72.8777,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
          tips: [
            "Avoid low-lying areas",
            "Do not walk through moving water",
            "Stay informed about weather updates",
            "Keep important documents in waterproof containers",
            "Prepare an emergency kit",
          ],
          radius: 20,
          createdBy: adminUser._id,
        },
        {
          type: "Tornado",
          severity: "High",
          location: {
            city: "Jaipur",
            state: "Rajasthan",
            lat: 26.9124,
            lng: 75.7873,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          tips: [
            "Go to a basement or an interior room on the lowest floor",
            "Stay away from windows",
            "Cover yourself with a mattress or blankets",
            "Evacuate mobile homes",
            "If caught outside, lie flat in a nearby ditch",
          ],
          radius: 15,
          createdBy: adminUser._id,
        },
        {
          type: "Landslide",
          severity: "Medium",
          location: {
            city: "Shimla",
            state: "Himachal Pradesh",
            lat: 31.1048,
            lng: 77.1734,
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
          tips: [
            "Move away from the path of a landslide",
            "Listen for unusual sounds like trees cracking",
            "Watch for changes in water flow or sudden increases in water levels",
            "Evacuate if instructed by authorities",
            "Avoid areas with recent landslides",
          ],
          radius: 10,
          createdBy: adminUser._id,
        },
      ]

      await DisasterAlert.insertMany(mockAlerts)
      console.log("Database seeded successfully with mock alerts")
    }
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

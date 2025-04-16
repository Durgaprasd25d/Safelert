import mongoose from "mongoose"

const disasterAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "Flood",
      "Earthquake",
      "Hurricane",
      "Wildfire",
      "Tornado",
      "Tsunami",
      "Drought",
      "Landslide",
      "Blizzard",
      "Cyclone",
    ],
  },
  severity: {
    type: String,
    required: true,
    enum: ["Low", "Medium", "High"],
  },
  location: {
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  tips: {
    type: [String],
    required: true,
  },
  radius: {
    type: Number,
    default: 50, // Default radius in kilometers
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

// Calculate severity based on disaster type and parameters
disasterAlertSchema.methods.calculateSeverity = function (parameters) {
  // This is a simplified example - in a real app, you would have more complex logic
  switch (this.type) {
    case "Flood":
      // parameters might include water level, rainfall rate, etc.
      return parameters.waterLevel > 5 ? "High" : parameters.waterLevel > 2 ? "Medium" : "Low"

    case "Earthquake":
      // parameters might include magnitude, depth, etc.
      return parameters.magnitude > 6.5 ? "High" : parameters.magnitude > 4.5 ? "Medium" : "Low"

    case "Hurricane":
    case "Cyclone":
      // parameters might include wind speed, storm surge, etc.
      return parameters.windSpeed > 110 ? "High" : parameters.windSpeed > 74 ? "Medium" : "Low"

    default:
      return "Medium" // Default severity
  }
}

// Generate safety tips based on disaster type and severity
disasterAlertSchema.methods.generateSafetyTips = function () {
  const tips = {
    Flood: {
      general: [
        "Move to higher ground immediately",
        "Avoid walking or driving through flood waters",
        "Stay away from power lines and electrical wires",
      ],
      High: [
        "Evacuate if told to do so",
        "Turn off utilities at the main switches if instructed",
        "Disconnect electrical appliances",
      ],
    },
    Earthquake: {
      general: [
        "Drop, cover, and hold on",
        "Stay away from windows and exterior walls",
        "If outdoors, stay in open areas away from buildings",
      ],
      High: [
        "Be prepared for aftershocks",
        "Check for gas leaks and damaged electrical wiring",
        "Evacuate if your building is unsafe",
      ],
    },
    Hurricane: {
      general: [
        "Stay indoors during the hurricane",
        "Keep away from windows and glass doors",
        "Take refuge in a small interior room, closet, or hallway",
      ],
      High: [
        "Evacuate if directed by authorities",
        "Secure your home by boarding up windows",
        "Prepare an emergency kit with food, water, and medications",
      ],
    },
    Cyclone: {
      general: ["Stay indoors and away from windows", "Listen to emergency broadcasts", "Prepare emergency supplies"],
      High: [
        "Evacuate if directed by authorities",
        "Secure loose objects outside your home",
        "Move to the strongest part of your house",
      ],
    },
    Wildfire: {
      general: [
        "Stay tuned to emergency alerts",
        "Keep doors and windows closed to prevent embers from entering",
        "Have evacuation plans ready",
      ],
      High: [
        "Evacuate immediately if ordered",
        "Wear protective clothing and footwear",
        "Prepare your home by removing flammable materials from around the structure",
      ],
    },
    Tornado: {
      general: [
        "Go to a basement or an interior room on the lowest floor",
        "Stay away from windows",
        "Cover yourself with a mattress or blankets",
      ],
      High: [
        "Evacuate mobile homes",
        "If caught outside, lie flat in a nearby ditch",
        "Do not try to outrun a tornado in your car",
      ],
    },
  }

  // Get general tips for the disaster type
  const generalTips = tips[this.type]?.general || []

  // Get severity-specific tips
  const severityTips = tips[this.type]?.[this.severity] || []

  // Combine tips
  return [...generalTips, ...severityTips]
}

export const DisasterAlert = mongoose.model("DisasterAlert", disasterAlertSchema)

"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin, AlertTriangle, Shield, Clock, Plus, Trash2, Users, Bell } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { io, type Socket } from "socket.io-client"
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"

interface Alert {
  _id: string
  type: string
  severity: "Low" | "Medium" | "High"
  location: {
    city: string
    state: string
    lat: number
    lng: number
  }
  timestamp: string
  tips: string[]
  radius: number
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  location?: {
    city?: string
    state?: string
    lat?: number
    lng?: number
  }
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20.296059, lng: 85.824539 })
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeTab, setActiveTab] = useState("alerts")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAlert, setNewAlert] = useState({
    type: "",
    severity: "",
    location: {
      city: "",
      state: "",
      lat: 0,
      lng: 0,
    },
    tips: [""],
    radius: 20,
  })
  const [tipInput, setTipInput] = useState("")

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    const userRole = localStorage.getItem("userRole")

    if (!token) {
      router.push("/")
    } else if (userRole !== "admin") {
      router.push("/dashboard")
    }
  }, [router])

  // Connect to socket.io
  useEffect(() => {
    socketRef.current = io("http://localhost:5000")

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  // Fetch alerts and users from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("Authentication required")
        }

        // Fetch alerts
        const alertsResponse = await fetch("http://localhost:5000/api/alerts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!alertsResponse.ok) {
          throw new Error("Failed to fetch alerts")
        }

        const alertsData = await alertsResponse.json()
        setAlerts(alertsData)

        // Fetch users
        const usersResponse = await fetch("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }

        const usersData = await usersResponse.json()
        setUsers(usersData)

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch data. Please try again later.")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Listen for real-time alert updates
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("alert-update", (newAlert: Alert) => {
        setAlerts((prevAlerts) => {
          // Check if the alert already exists
          const exists = prevAlerts.some((alert) => alert._id === newAlert._id)

          if (exists) {
            // Update existing alert
            return prevAlerts.map((alert) => (alert._id === newAlert._id ? newAlert : alert))
          } else {
            // Add new alert
            return [newAlert, ...prevAlerts]
          }
        })
      })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    router.push("/")
  }

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setSelectedLocation({ lat, lng })
      setNewAlert((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          lat,
          lng,
        },
      }))
    }
  }

  const handleAddTip = () => {
    if (tipInput.trim()) {
      setNewAlert((prev) => ({
        ...prev,
        tips: [...prev.tips, tipInput.trim()],
      }))
      setTipInput("")
    }
  }

  const handleRemoveTip = (index: number) => {
    setNewAlert((prev) => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index),
    }))
  }

  const handleCreateAlert = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication required")
      }

      // Validate form
      if (!newAlert.type || !newAlert.severity || !newAlert.location.city || !newAlert.location.state) {
        throw new Error("Please fill all required fields")
      }

      const response = await fetch("http://localhost:5000/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAlert),
      })

      if (!response.ok) {
        throw new Error("Failed to create alert")
      }

      const createdAlert = await response.json()

      // Add to local state
      setAlerts((prev) => [createdAlert, ...prev])

      // Emit to socket
      if (socketRef.current) {
        socketRef.current.emit("new-alert", createdAlert)
      }

      // Reset form
      setNewAlert({
        type: "",
        severity: "",
        location: {
          city: "",
          state: "",
          lat: 0,
          lng: 0,
        },
        tips: [""],
        radius: 20,
      })
      setSelectedLocation(null)
      setIsCreateDialogOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to create alert")
    }
  }

  const handleDeleteAlert = async (id: string) => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`http://localhost:5000/api/alerts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete alert")
      }

      // Remove from local state
      setAlerts((prev) => prev.filter((alert) => alert._id !== id))
    } catch (err: any) {
      setError(err.message || "Failed to delete alert")
    }
  }

  const severityColor = {
    Low: "bg-green-100 text-green-800 hover:bg-green-100",
    Medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    High: "bg-red-100 text-red-800 hover:bg-red-100",
  }

  const iconMap = {
    Flood: "🌊",
    Earthquake: "🌋",
    Hurricane: "🌀",
    Wildfire: "🔥",
    Tornado: "🌪️",
    Tsunami: "🌊",
    Drought: "☀️",
    Landslide: "⛰️",
    Blizzard: "❄️",
    Cyclone: "🌀",
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-xl">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage disaster alerts and users</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Alerts Management
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Users Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Disaster Alerts</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Disaster Alert</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new disaster alert. Click on the map to select the affected
                    location.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Disaster Type</Label>
                      <Select
                        value={newAlert.type}
                        onValueChange={(value) => setNewAlert((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flood">Flood</SelectItem>
                          <SelectItem value="Earthquake">Earthquake</SelectItem>
                          <SelectItem value="Hurricane">Hurricane</SelectItem>
                          <SelectItem value="Wildfire">Wildfire</SelectItem>
                          <SelectItem value="Tornado">Tornado</SelectItem>
                          <SelectItem value="Tsunami">Tsunami</SelectItem>
                          <SelectItem value="Drought">Drought</SelectItem>
                          <SelectItem value="Landslide">Landslide</SelectItem>
                          <SelectItem value="Blizzard">Blizzard</SelectItem>
                          <SelectItem value="Cyclone">Cyclone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select
                        value={newAlert.severity}
                        onValueChange={(value) => setNewAlert((prev) => ({ ...prev, severity: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newAlert.location.city}
                        onChange={(e) =>
                          setNewAlert((prev) => ({
                            ...prev,
                            location: { ...prev.location, city: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={newAlert.location.state}
                        onChange={(e) =>
                          setNewAlert((prev) => ({
                            ...prev,
                            location: { ...prev.location, state: e.target.value },
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="radius">Affected Radius (km)</Label>
                      <Input
                        id="radius"
                        type="number"
                        value={newAlert.radius}
                        onChange={(e) =>
                          setNewAlert((prev) => ({
                            ...prev,
                            radius: Number.parseInt(e.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Location on Map</Label>
                      {isLoaded ? (
                        <div className="h-[200px] w-full rounded-md border">
                          <GoogleMap
                            mapContainerStyle={{ width: "100%", height: "100%" }}
                            center={mapCenter}
                            zoom={10}
                            onClick={(e) => {
                              if (e.latLng) {
                                const lat = e.latLng.lat()
                                const lng = e.latLng.lng()
                                setSelectedLocation({ lat, lng })
                                setNewAlert((prev) => ({
                                  ...prev,
                                  location: {
                                    ...prev.location,
                                    lat,
                                    lng,
                                  },
                                }))
                              }
                            }}
                          >
                            {selectedLocation && <Marker position={selectedLocation} />}
                          </GoogleMap>
                        </div>
                      ) : (
                        <div className="h-[200px] w-full rounded-md border flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      )}
                      {selectedLocation && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Safety Tips</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={tipInput}
                          onChange={(e) => setTipInput(e.target.value)}
                          placeholder="Add a safety tip"
                        />
                        <Button type="button" onClick={handleAddTip} size="sm">
                          Add
                        </Button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {newAlert.tips
                          .filter((tip) => tip.trim())
                          .map((tip, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between rounded-md bg-muted p-2 text-sm"
                            >
                              <span>{tip}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTip(index)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAlert}>Create Alert</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {error && <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">{error}</div>}

          {alerts.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No alerts found</h3>
              <p className="mt-2 text-muted-foreground">Create your first alert to get started.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alerts.map((alert) => (
                <Card key={alert._id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={severityColor[alert.severity]}>
                        {alert.severity} Severity
                      </Badge>
                      <span className="text-2xl" role="img" aria-label={alert.type}>
                        {iconMap[alert.type as keyof typeof iconMap] || "⚠️"}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{alert.type}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {alert.location.city}, {alert.location.state}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{formatDate(alert.timestamp)}</span>
                    </div>
                    <p className="mt-3 line-clamp-2">{alert.tips[0]}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Shield className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                            {alert.type} Alert Details
                          </DialogTitle>
                          <DialogDescription>Alert information and safety tips.</DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Location</h4>
                              <p>
                                {alert.location.city}, {alert.location.state}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ({alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)})
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Affected Radius</h4>
                              <p>{alert.radius} km</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium">Safety Tips</h4>
                            <ul className="ml-6 list-disc space-y-2 mt-2">
                              {alert.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Registered Users</h2>

            {users.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No users found</h3>
                <p className="mt-2 text-muted-foreground">There are currently no registered users.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Registered On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-b">
                          <td className="px-4 py-3 text-sm">{user.name}</td>
                          <td className="px-4 py-3 text-sm">{user.email}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={user.role === "admin" ? "default" : "outline"}>{user.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {user.location?.city && user.location?.state ? (
                              <span>
                                {user.location.city}, {user.location.state}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{formatDate(user.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

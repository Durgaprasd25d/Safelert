"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, AlertTriangle, Shield, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { io, type Socket } from "socket.io-client"
import { GoogleMap, useJsApiLoader, Marker, Circle } from "@react-google-maps/api"

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

interface UserLocation {
  city?: string
  state?: string
  lat?: number
  lng?: number
  loading: boolean
  error?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation>({
    loading: true,
  })
  const socketRef = useRef<Socket | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  })

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords

            // Set map center
            setMapCenter({ lat: latitude, lng: longitude })

            // In a real app, you would use a reverse geocoding service here
            // For demo purposes, we'll simulate getting city/state
            setUserLocation({
              lat: latitude,
              lng: longitude,
              city: "Bhubaneswar", // Simulated for demo
              state: "Odisha", // Simulated for demo
              loading: false,
            })

            // Update user location in the database
            const token = localStorage.getItem("token")
            if (token) {
              await fetch("http://localhost:5000/api/auth/update-location", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  lat: latitude,
                  lng: longitude,
                  city: "Bhubaneswar", // Simulated for demo
                  state: "Odisha", // Simulated for demo
                }),
              })
            }

            // Join location-based room for real-time alerts
            if (socketRef.current) {
              socketRef.current.emit("join-location", { lat: latitude, lng: longitude })
            }
          } catch (err) {
            setUserLocation({
              loading: false,
              error: "Failed to get location details",
            })
          }
        },
        (err) => {
          setUserLocation({
            loading: false,
            error: "Location access denied. Please enable location services.",
          })
        },
      )
    } else {
      setUserLocation({
        loading: false,
        error: "Geolocation is not supported by your browser",
      })
    }
  }, [])

  // Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        if (userLocation.lat && userLocation.lng) {
          const response = await fetch(
            `http://localhost:5000/api/alerts/location?lat=${userLocation.lat}&lng=${userLocation.lng}`,
          )

          if (!response.ok) {
            throw new Error("Failed to fetch alerts")
          }

          const data = await response.json()
          setAlerts(data)
        } else {
          const response = await fetch("http://localhost:5000/api/alerts")

          if (!response.ok) {
            throw new Error("Failed to fetch alerts")
          }

          const data = await response.json()
          setAlerts(data)
        }

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "Failed to fetch alerts. Please try again later.")
        setLoading(false)
      }
    }

    if (!userLocation.loading) {
      fetchAlerts()
    }
  }, [userLocation])

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
        <span className="ml-2 text-xl">Loading alerts...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disaster Alert Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Stay informed about disasters in your area and learn how to stay safe
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {userLocation.error ? (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
            <span>{userLocation.error}</span>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="flex items-center p-4">
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            <span>
              Your location:{" "}
              <strong>
                {userLocation.city}, {userLocation.state}
              </strong>
              {userLocation.lat && userLocation.lng && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
                </span>
              )}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Google Map */}
      {isLoaded && mapCenter && (
        <div className="mb-6 h-[400px] w-full rounded-lg border">
          <GoogleMap mapContainerStyle={{ width: "100%", height: "100%" }} center={mapCenter} zoom={10}>
            {/* User location marker */}
            <Marker
              position={mapCenter}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />

            {/* Alert markers */}
            {alerts.map((alert) => (
              <div key={alert._id}>
                <Marker
                  position={{ lat: alert.location.lat, lng: alert.location.lng }}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                  onClick={() => setSelectedAlert(alert)}
                />
                <Circle
                  center={{ lat: alert.location.lat, lng: alert.location.lng }}
                  radius={alert.radius * 1000} // Convert km to meters
                  options={{
                    fillColor:
                      alert.severity === "High" ? "#f87171" : alert.severity === "Medium" ? "#fbbf24" : "#86efac",
                    fillOpacity: 0.35,
                    strokeColor:
                      alert.severity === "High" ? "#ef4444" : alert.severity === "Medium" ? "#f59e0b" : "#22c55e",
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                  }}
                />
              </div>
            ))}
          </GoogleMap>
        </div>
      )}

      {error ? (
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-medium">Error</h3>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No alerts found</h3>
          <p className="mt-2 text-muted-foreground">There are currently no active alerts for your location.</p>
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
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      View Safety Tips
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                        Safety Tips for {alert.type}
                      </DialogTitle>
                      <DialogDescription>Follow these guidelines to stay safe during this disaster.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <ul className="ml-6 list-disc space-y-2">
                        {alert.tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                      <div className="rounded-md bg-muted p-4">
                        <h4 className="mb-2 font-medium">Emergency Contacts</h4>
                        <p className="text-sm">
                          National Emergency: <strong>112</strong>
                        </p>
                        <p className="text-sm">
                          Disaster Management: <strong>1078</strong>
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

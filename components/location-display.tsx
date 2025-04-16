import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2, AlertCircle } from "lucide-react"

interface UserLocation {
  city?: string
  state?: string
  lat?: number
  lng?: number
  loading: boolean
  error?: string
}

interface LocationDisplayProps {
  userLocation: UserLocation
}

export function LocationDisplay({ userLocation }: LocationDisplayProps) {
  if (userLocation.loading) {
    return (
      <Card>
        <CardContent className="flex items-center p-4">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Detecting your location...</span>
        </CardContent>
      </Card>
    )
  }

  if (userLocation.error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center p-4">
          <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
          <span>{userLocation.error}</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
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
  )
}

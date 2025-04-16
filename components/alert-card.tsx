"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, MapPin, Shield } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
}

interface AlertCardProps {
  alert: Alert
}

export function AlertCard({ alert }: AlertCardProps) {
  const [open, setOpen] = useState(false)

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
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Shield className="mr-2 h-4 w-4" />
              View Safety Tips
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
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
  )
}

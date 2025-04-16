"use client";
import { Clock, MapPin, Shield, Trash2, AlertTriangle } from "lucide-react";
import React, { useState } from "react";

interface Alert {
  _id: string;
  type: string;
  severity: "Low" | "Medium" | "High";
  location: { city: string; state: string; lat: number; lng: number };
  timestamp: string;
  tips: string[];
  radius: number;
}

interface Props {
  alert: Alert;
  onDelete: (id: string) => void;
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
};

const severityColor: Record<string, string> = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const AlertCard: React.FC<Props> = ({ alert, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 shadow-md transition-all hover:shadow-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${severityColor[alert.severity]}`}>
          {alert.severity} Severity
        </span>
        <span className="text-2xl" role="img" aria-label={alert.type}>
          {iconMap[alert.type as keyof typeof iconMap] || "⚠️"}
        </span>
      </div>
      <h2 className="text-xl font-semibold mb-2">{alert.type}</h2>
      <p className="flex items-center text-sm text-gray-500 mb-2">
        <MapPin className="mr-1 h-4 w-4" />
        {alert.location.city}, {alert.location.state}
      </p>
      <div className="flex items-center text-sm text-gray-500 mb-2">
        <Clock className="mr-1 h-4 w-4" />
        <span>{formatDate(alert.timestamp)}</span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{alert.tips[0]}</p>

      <div className="flex justify-between items-center">
        <button
          onClick={toggleModal}
          className="flex items-center text-blue-600 hover:bg-blue-100 rounded-md px-4 py-2 text-sm"
        >
          <Shield className="mr-2 h-4 w-4" />
          View Details
        </button>

        <button
          onClick={() => onDelete(alert._id)}
          className="text-sm text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
                {alert.type} Alert Details
              </h3>
              <button
                onClick={toggleModal}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p>{alert.location.city}, {alert.location.state}</p>
                  <p className="text-xs text-gray-500">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCard;

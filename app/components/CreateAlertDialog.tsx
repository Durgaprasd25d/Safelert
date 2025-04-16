"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
const MapSelector = dynamic(() => import("./MapSelector"), {
  ssr: false,
});

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Props {
  onSuccess: (alert: any) => void;
  onClose: () => void;
}

const initialAlert = {
  type: "",
  severity: "",
  location: { city: "", state: "", lat: 0, lng: 0 },
  tips: [""],
  radius: 20,
};

const LocationSelector = ({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const CreateAlertDialog: React.FC<Props> = ({ onSuccess, onClose }) => {
  const [newAlert, setNewAlert] = useState(initialAlert);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [tipInput, setTipInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const mapCenter: LatLngExpression = [20.2961, 85.8245];

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleAddTip = () => {
    if (tipInput.trim()) {
      setNewAlert((prev) => ({
        ...prev,
        tips: [...prev.tips, tipInput.trim()],
      }));
      setTipInput("");
    }
  };

  const handleRemoveTip = (index: number) => {
    setNewAlert((prev) => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index),
    }));
  };

  const handleCreateAlert = async () => {
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      return setError("Authentication required.");
    }

    if (
      !newAlert.type ||
      !newAlert.severity ||
      !newAlert.location.city ||
      !newAlert.location.state
    ) {
      return setError("Please fill all required fields.");
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAlert),
      });

      if (!res.ok) throw new Error("Failed to create alert");

      const createdAlert = await res.json();
      socketRef.current?.emit("new-alert", createdAlert);
      onSuccess(createdAlert);
      setNewAlert(initialAlert);
      setSelectedLocation(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl p-6 bg-white rounded-lg shadow-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Create New Disaster Alert</h2>
      <p className="mb-6 text-sm text-gray-600">
        Fill in the details below and select a location on the map.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Disaster Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newAlert.type}
              onChange={(e) =>
                setNewAlert((prev) => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">Select type</option>
              {[
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
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Severity
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newAlert.severity}
              onChange={(e) =>
                setNewAlert((prev) => ({ ...prev, severity: e.target.value }))
              }
            >
              <option value="">Select severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newAlert.location.city}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newAlert.location.state}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  location: { ...prev.location, state: e.target.value },
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Radius (km)
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={newAlert.radius}
              onChange={(e) =>
                setNewAlert((prev) => ({
                  ...prev,
                  radius: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>

        {/* Right Side: Map & Tips */}
        <div className="space-y-4">
          {/* Map */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Location on Map
            </label>
            <div className="h-[250px] w-full rounded-md border overflow-hidden">
              <MapSelector
                center={[20.2961, 85.8245]}
                selectedLocation={selectedLocation}
                onSelect={(lat, lng) => {
                  setSelectedLocation({ lat, lng });
                  setNewAlert((prev) => ({
                    ...prev,
                    location: { ...prev.location, lat, lng },
                  }));
                }}
              />
            </div>

            {selectedLocation && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </p>
            )}
          </div>

          {/* Tips */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Safety Tips
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                className="w-full p-2 border border-gray-300 rounded-md"
                value={tipInput}
                onChange={(e) => setTipInput(e.target.value)}
                placeholder="Add a safety tip"
              />
              <button
                type="button"
                className="bg-blue-500 text-white px-3 rounded-md"
                onClick={handleAddTip}
              >
                Add
              </button>
            </div>
            {newAlert.tips
              .filter((tip) => tip.trim())
              .map((tip, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-gray-100 rounded px-3 py-2 mb-2 text-sm"
                >
                  <span>{tip}</span>
                  <button onClick={() => handleRemoveTip(i)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-md text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateAlert}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Alert"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateAlertDialog;

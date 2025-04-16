"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { io, Socket } from "socket.io-client";
import CreateAlertDialog from "./CreateAlertDialog";
import AlertCard from "./AlertCard";

interface Alert {
  _id: string;
  type: string;
  severity: "Low" | "Medium" | "High";
  location: { city: string; state: string; lat: number; lng: number };
  timestamp: string;
  tips: string[];
  radius: number;
}

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connect to socket
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    console.log("Socket connected: ", socketRef.current.connected); // Check if socket is connected
  
    // Listen for real-time alert updates
    socketRef.current.on("alert-update", (newAlert: Alert) => {
      setAlerts((prev) => {
        const exists = prev.find((a) => a._id === newAlert._id);
        return exists
          ? prev.map((a) => (a._id === newAlert._id ? newAlert : a)) // Update existing alert
          : [newAlert, ...prev]; // Add new alert
      });
    });
  
    return () => {
      if (socketRef.current) {
        socketRef.current.off("alert-update"); // Remove listener when component unmounts
        socketRef.current.disconnect();
      }
    };
  }, []);
  

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/alerts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch alerts");
        const data = await res.json();
        setAlerts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);

  const handleDeleteAlert = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/alerts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete alert");
      setAlerts((prev) => prev.filter((alert) => alert._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateAlertSuccess = (newAlert: Alert) => {
    setAlerts((prev) => [newAlert, ...prev]); // Add new alert to state
    setIsCreateDialogOpen(false); // Close dialog on success
  };
  
  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsCreateDialogOpen(true)}
        className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none"
      >
        <Plus className="mr-2" /> Create Alert
      </button>

      {/* Modal for Creating Alert */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <CreateAlertDialog onSuccess={handleCreateAlertSuccess} onClose={() => setIsCreateDialogOpen(false)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard key={alert._id} alert={alert} onDelete={handleDeleteAlert} />
          ))}
        </div>
      )}
    </div>
  );
}

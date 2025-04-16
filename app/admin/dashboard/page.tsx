"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Headers from "../../components/Headers";
import AlertsManagement from "../../components/AlertsManagement";
import UsersManagement from "../../components/UsersManagement";
import { Bell, Users } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("alerts");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token) router.push("/");
    else if (role !== "admin") router.push("/dashboard");
  }, [router]);

  const handleLogout = () => {
    ["token", "userId", "userName", "userEmail", "userRole"].forEach((key) =>
      localStorage.removeItem(key)
    );
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Headers
        title="Admin Panel"
        subtitle="Manage users and settings"
        onLogout={handleLogout}
        logoutLabel="Sign out"
      />

      {/* Tabs Header */}
      <div className="mb-4 grid w-full grid-cols-2 border rounded-md overflow-hidden">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "alerts"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Bell className="mr-2 h-4 w-4" />
          Alerts Management
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "users"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          <Users className="mr-2 h-4 w-4" />
          Users Management
        </button>
      </div>

      {/* Tabs Content */}
      <div className="mt-4">
        {activeTab === "alerts" && <AlertsManagement />}
        {activeTab === "users" && <UsersManagement />}
      </div>
    </div>
  );
}

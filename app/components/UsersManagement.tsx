"use client";
import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  location?: {
    city?: string;
    state?: string;
  };
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p className="text-sm">Loading users...</p>;
  }

  return (
    <div className="space-y-4 px-4 sm:px-8 md:px-16">
      <h2 className="text-xl font-semibold">Registered Users</h2>

      {error && (
        <div className="rounded-md bg-red-100 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No users found</h3>
          <p className="mt-2 text-gray-500">
            There are currently no registered users.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b bg-gray-100">
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
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {user.location?.city && user.location?.state ? (
                      <span>{user.location.city}, {user.location.state}</span>
                    ) : (
                      <span className="text-gray-500">Not set</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;

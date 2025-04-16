import React from "react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  logoutLabel?: string;
}

export default function AdminHeader({
  title,
  subtitle,
  onLogout,
  logoutLabel,
}: AdminHeaderProps) {
  return (
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          {title && (
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          )}
          {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
        </div>
        {onLogout && (
          <Button variant="outline" onClick={onLogout}>
            {logoutLabel || "Logout"}
          </Button>
        )}
      </header>
  );
}

"use client"

import { Button } from "@/components/ui/button"

interface AlertFilterProps {
  types: string[]
  activeFilter: string
  onFilterChange: (type: string) => void
}

export function AlertFilter({ types, activeFilter, onFilterChange }: AlertFilterProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Filter by disaster type:</h3>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type}
            variant={activeFilter === type ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  )
}

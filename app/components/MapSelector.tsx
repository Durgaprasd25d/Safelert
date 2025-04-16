"use client";
import React from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { LatLngExpression } from "leaflet";

interface Props {
  center: LatLngExpression;
  selectedLocation: { lat: number; lng: number } | null;
  onSelect: (lat: number, lng: number) => void;
}

const LocationSelector = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const MapSelector: React.FC<Props> = ({ center, selectedLocation, onSelect }) => {
  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationSelector onSelect={onSelect} />
      {selectedLocation && (
        <Marker position={[selectedLocation.lat, selectedLocation.lng] as LatLngExpression} />
      )}
    </MapContainer>
  );
};

export default MapSelector;

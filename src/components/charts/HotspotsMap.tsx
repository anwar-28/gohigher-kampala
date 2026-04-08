"use client";
import { useEffect, useRef, useState } from "react";
import { Hotspot } from "@/lib/services";
import { Skeleton } from "@/components/ui";

const severityColors: Record<number, string> = {
  1: "#10b981", // green
  2: "#f59e0b", // amber
  3: "#f97316", // orange
  4: "#ef4444", // red
  5: "#7c2d12", // dark red
};

interface HotspotsMapProps {
  hotspots: Hotspot[];
  loading: boolean;
}

export function HotspotsMap({ hotspots, loading }: HotspotsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Default center (Kampala)
  const DEFAULT_CENTER = { lat: 0.3476, lng: 32.5825 };

  useEffect(() => {
    // Load Google Maps API
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapContainer.current || !hotspots.length) return;

    // Initialize map
    if (!map.current) {
      map.current = new google.maps.Map(mapContainer.current, {
        zoom: 12,
        center: DEFAULT_CENTER,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: false,
        scrollwheel: true,
      });
    }

    // Clear existing markers
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    // Add markers for each hotspot
    hotspots.forEach((hotspot) => {
      // Geocode location to lat/lng (for demo, using mock coordinates)
      // In production, you'd use Geocoding API
      const lat = DEFAULT_CENTER.lat + (Math.random() - 0.5) * 0.1;
      const lng = DEFAULT_CENTER.lng + (Math.random() - 0.5) * 0.1;

      const markerColor = severityColors[hotspot.severity_level] || "#10b981";

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map.current,
        title: hotspot.location,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8 + hotspot.severity_level * 2,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Inter, sans-serif;">
            <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px;">${hotspot.location}</p>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">Severity: <span style="font-weight: bold; color: ${markerColor};">Level ${hotspot.severity_level}</span></p>
            <p style="margin: 0; font-size: 12px; color: #666;">Reports: <span style="font-weight: bold;">${hotspot.report_count}</span></p>
          </div>
        `,
      });

      marker.addListener("click", () => {
        // Close all other info windows
        infoWindow.open(map.current, marker);
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markers.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markers.current.forEach((marker) => {
        bounds.extend(marker.getPosition()!);
      });
      map.current.fitBounds(bounds);

      // Add some padding
      const padding = 80;
      map.current.panToBounds(bounds);
    }
  }, [mapLoaded, hotspots]);

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="rounded-2xl hidden overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainer} className="w-full h-96" />
      {!mapLoaded && (
        <div className="flex items-center justify-center h-96 bg-slate-50">
          <p className="text-slate-500">Loading map...</p>
        </div>
      )}
    </div>
  );
}

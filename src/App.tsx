import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 37.7749, // San Francisco Latitude
  lng: -122.4194, // San Francisco Longitude
};

// Required Google Maps libraries
const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"];

const App = () => {
  const [, setMap] = useState<google.maps.Map | null>(null);
  const [, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const [area, setArea] = useState<number | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDG2xnUUoT6fLcPZJ1Q4hOd-UMVIZwUlzo",
    libraries,
  });

  // Map load handler
  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded:", map);
    setMap(map);

    // Initialize DrawingManager
    const drawingManagerInstance = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.BOTTOM_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.RECTANGLE,
        ],
      },
      polygonOptions: {
        fillColor: "#2196F3",
        fillOpacity: 0.5,
        strokeColor: "#0D47A1",
        strokeWeight: 2,
        clickable: true,
        editable: true,
      },
    });

    // Attach DrawingManager to the map
    drawingManagerInstance.setMap(map);

    // Handle overlaycomplete event
    google.maps.event.addListener(
      drawingManagerInstance,
      "overlaycomplete",
      (event: google.maps.drawing.OverlayCompleteEvent) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          const polygon = event.overlay as google.maps.Polygon;
          handlePolygonComplete(polygon);
        }
      }
    );

    setDrawingManager(drawingManagerInstance);
  }, []);

  // Handle polygon completion
  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray();
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    setArea(area);
    console.log(
      "Polygon completed:",
      path.map((point) => point.toJSON())
    );
    console.log("Polygon area (m²):", area);

    // Optional: Remove the polygon after calculating the area
    polygon.setMap(null);
  };

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading Google Maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={onLoad}
    >
      {/* Area Info Box */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h3>Draw Area Calculator</h3>
        {area !== null ? (
          <p>
            Selected Area: <b>{area.toFixed(2)}</b> m²
          </p>
        ) : (
          <p>Use the drawing tools to draw a polygon and calculate the area.</p>
        )}
      </div>
    </GoogleMap>
  );
};

export default React.memo(App);

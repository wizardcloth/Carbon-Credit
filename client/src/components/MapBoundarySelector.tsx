import React, { useRef, useState } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import type { FeatureGroup as LeafletFeatureGroup } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw"; // must come before react-leaflet-draw usage
import "leaflet-draw/dist/leaflet.draw.css";
import "./map.css";

interface MapBoundarySelectorProps {
  onBoundaryChange: (
    geojson: GeoJSON.Feature | GeoJSON.FeatureCollection | null
  ) => void;
}

const SearchControl: React.FC<{
  onSelect: (lat: number, lon: number) => void;
}> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const map = useMap();

  const fetchSuggestions = async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(
          value
        )}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Suggestion fetch error:", err);
    }
  };

  const handleSelectSuggestion = (place: any) => {
    setQuery(place.display_name);
    setSelectedPlace(place);
    setResults([]);
  };

  const handleSearch = async () => {
    try {
      let lat: number, lon: number;

      if (selectedPlace) {
        lat = parseFloat(selectedPlace.lat);
        lon = parseFloat(selectedPlace.lon);
      } else {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}`
        );
        const data = await res.json();
        if (!data?.length) {
          alert("No location found. Try another name.");
          return;
        }
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);
      }

      map.setView([lat, lon], 14);
      onSelect(lat, lon);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="absolute bottom-3 left-3 z-[1000] bg-white p-2 rounded shadow-md flex gap-2 items-center">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedPlace(null);
            fetchSuggestions(e.target.value);
          }}
          placeholder="Search village or field..."
          className="border px-2 py-1 rounded w-56 text-sm"
        />

        {results.length > 0 && (
          <ul className="absolute left-0 bottom-full mb-1 border rounded bg-white max-h-40 overflow-y-auto text-sm shadow-md w-full">
            {results.map((r) => (
              <li
                key={r.place_id}
                className="px-2 py-1 hover:bg-green-100 cursor-pointer"
                onClick={() => handleSelectSuggestion(r)}
              >
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSearch}
        type="button"
        className="bg-green-600 text-white px-3 py-1 rounded text-sm whitespace-nowrap"
      >
        Search
      </button>
    </div>
  );
};

const MapBoundarySelector: React.FC<MapBoundarySelectorProps> = ({
  onBoundaryChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([
    28.6815, 77.2228,
  ]);
  const featureGroupRef = useRef<LeafletFeatureGroup>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  // ✅ FIXED: Proper TypeScript types for GeoJSON Feature
  const onCreated = (e: any) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();

    // ✅ Fix coordinate format
    const coordinates = geojson.geometry.coordinates[0].map((coord: any) => {
      const lng = typeof coord[0] === 'number' ? coord[0] : parseFloat(coord[0]);
      const lat = typeof coord[1] === 'number' ? coord[1] : parseFloat(coord[1]);
      return [lng, lat];
    });

    // ✅ FIXED: Use proper GeoJSON.Feature type with literal "Feature" type
    const fixedBoundary: GeoJSON.Feature = {
      type: "Feature" as const, // ✅ Use 'as const' to make it literal type
      geometry: {
        type: "Polygon" as const, // ✅ Use 'as const' for literal type
        coordinates: [coordinates],
      },
      properties: geojson.properties || {},
    };

    console.log("✅ Boundary created with fixed coordinates:", fixedBoundary);
    onBoundaryChange(fixedBoundary);

    // Clear previous drawings
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      featureGroupRef.current.addLayer(layer);
    }
  };

  // ✅ FIXED: Same type fix for onEdited
  const onEdited = (e: any) => {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      const geojson = layer.toGeoJSON();
      
      const coordinates = geojson.geometry.coordinates[0].map((coord: any) => {
        const lng = typeof coord[0] === 'number' ? coord[0] : parseFloat(coord[0]);
        const lat = typeof coord[1] === 'number' ? coord[1] : parseFloat(coord[1]);
        return [lng, lat];
      });

      // ✅ FIXED: Proper GeoJSON.Feature type
      const fixedBoundary: GeoJSON.Feature = {
        type: "Feature" as const,
        geometry: {
          type: "Polygon" as const,
          coordinates: [coordinates],
        },
        properties: geojson.properties || {},
      };

      console.log("✅ Boundary edited with fixed coordinates:", fixedBoundary);
      onBoundaryChange(fixedBoundary);
    });
  };

  const onDeleted = () => {
    console.log("🗑️ Boundary deleted");
    onBoundaryChange(null);
  };

  return (
    <div className="relative h-[400px] w-full rounded-lg overflow-hidden border mt-4">
      <MapContainer
        center={position}
        zoom={10}
        scrollWheelZoom
        className="h-full w-full"
      >
        <SearchControl onSelect={(lat, lon) => setPosition([lat, lon])} />
        
        <button
          onClick={() => setIsSatellite((prev) => !prev)}
          className="absolute bottom-3 right-3 z-[1000] bg-white p-2 rounded shadow-md text-sm hover:bg-gray-100 transition-colors"
        >
          {isSatellite ? "Switch to Street" : "Switch to Satellite"}
        </button>

        <TileLayer
          url={
            isSatellite
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution={
            isSatellite
              ? '&copy; <a href="https://www.esri.com/">Esri</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
        />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={onCreated}
            onEdited={onEdited}
            onDeleted={onDeleted}
            draw={{
              polygon: {
                allowIntersection: false,
                showArea: false,
                shapeOptions: {
                  color: "#FF0000",
                  fillColor: "#FFFF00",
                  fillOpacity: 0.3,
                  weight: 3,
                },
              },
              rectangle: false,
              marker: false,
              circle: false,
              circlemarker: false,
              polyline: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>

      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> 
          1. Search for your location above
          2. Use the polygon tool (⬟) to draw your field boundary
          3. Click points around your field, then click the first point to close it
          4. The boundary will be saved automatically
        </p>
      </div>
    </div>
  );
};

export default MapBoundarySelector;

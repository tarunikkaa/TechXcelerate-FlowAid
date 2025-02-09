import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Tooltip, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDisasters } from "./DisasterService";
import { haversineDistance } from "./locationUtils"; // Fixed import

const InteractiveMapPage = () => {
  const [disasterZones, setDisasterZones] = useState([]);
  const [hoveredDisaster, setHoveredDisaster] = useState(null);

  useEffect(() => {
    const fetchDisasters = async () => {
      const data = await getDisasters();
      console.log("Fetched Disasters:", data);
      setDisasterZones(
        data.map((doc) => ({
          id: doc.id,
          ...doc,
          coords: [doc.latitude, doc.longitude],
        }))
      );
    };
    fetchDisasters();
  }, []);

  const ngos = [
    { id: 1, name: "NGO 1", coords: [28.7041, 77.1025], resources: 50 },
    { id: 2, name: "NGO 2", coords: [19.076, 72.8777], resources: 30 },
    { id: 3, name: "NGO 3", coords: [13.0827, 80.2707], resources: 40 },
  ];

  const safeZones = [
    { id: 1, location: "Safe City 1", coords: [21.1458, 79.0882] },
    { id: 2, location: "Safe City 2", coords: [25.5941, 85.1376] },
  ];

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Disaster Zones (Red Circles) */}
        {disasterZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.coords}
            radius={50000}
            pathOptions={{ color: "red" }}
            eventHandlers={{
              mouseover: () => setHoveredDisaster(zone),
              mouseout: () => setHoveredDisaster(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <b>{zone.location} (Disaster Zone)</b> <br />
              Severity: {zone.severity}
            </Tooltip>
          </Circle>
        ))}

        {/* Safe Zones (Green Circles) */}
        {safeZones.map((zone) => (
          <Circle key={zone.id} center={zone.coords} radius={30000} pathOptions={{ color: "green" }}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <b>{zone.location} (Safe Zone)</b>
            </Tooltip>
          </Circle>
        ))}

        {/* NGOs (Blue Circles) */}
        {ngos.map((ngo) => (
          <Circle key={ngo.id} center={ngo.coords} radius={20000} pathOptions={{ color: "blue" }}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <b>{ngo.name}</b> <br />
              Resources: {ngo.resources}
            </Tooltip>
          </Circle>
        ))}

        {/* Draw lines from hovered disaster to NGOs with distances */}
        {hoveredDisaster &&
          ngos.map((ngo) => {
            const distance = haversineDistance(hoveredDisaster.coords, ngo.coords).toFixed(2);
            console.log(`Distance from ${hoveredDisaster.location} to ${ngo.name}: ${distance} km`);
            return (
              <Polyline key={ngo.id} positions={[hoveredDisaster.coords, ngo.coords]} color="purple">
                <Tooltip direction="center" offset={[0, 0]} opacity={1} permanent>
                  <b>{ngo.name}</b> <br />
                  Resources: {ngo.resources} <br />
                  Distance: {distance} km
                </Tooltip>
              </Polyline>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default InteractiveMapPage;

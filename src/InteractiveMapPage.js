import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Circle, Tooltip, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDisasters } from "./DisasterService";
import { haversineDistance as calculateDistance } from "./locationUtils";

const InteractiveMapPage = () => {
  const [disasterZones, setDisasterZones] = useState([]);
  const [hoveredDisaster, setHoveredDisaster] = useState(null);
  const [bestNGO, setBestNGO] = useState(null); // Stores the best NGO

  useEffect(() => {
    const fetchDisasters = async () => {
      const data = await getDisasters();
      setDisasterZones(data.map(doc => ({
        id: doc.id,
        ...doc,
        coords: [doc.latitude, doc.longitude],
      })));
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

  // Function to find the best NGO when a disaster is hovered
  const findBestNGO = (disaster) => {
    let bestNGO = null;
    let bestScore = -Infinity;

    ngos.forEach((ngo) => {
      const distance = calculateDistance(disaster.coords, ngo.coords);
      const score = ngo.resources / distance; // Higher score = better NGO

      if (score > bestScore) {
        bestScore = score;
        bestNGO = { ...ngo, distance: distance.toFixed(2) };
      }
    });

    setBestNGO(bestNGO);
  };

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
              mouseover: () => {
                setHoveredDisaster(zone);
                findBestNGO(zone);
              },
              mouseout: () => {
                setHoveredDisaster(null);
                setBestNGO(null);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <b>{zone.location} (Disaster Zone)</b> <br />
              Severity: {zone.severity}
            </Tooltip>
          </Circle>
        ))}

        {/* Safe Zones (Green Circles) */}
        {safeZones.map((zone) => (
          <Circle key={zone.id} center={zone.coords} radius={30000} pathOptions={{ color: "green" }}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <b>{zone.location} (Safe Zone)</b>
            </Tooltip>
          </Circle>
        ))}

        {/* NGOs (Blue Circles) */}
        {ngos.map((ngo) => (
          <Circle key={ngo.id} center={ngo.coords} radius={20000} pathOptions={{ color: "blue" }}>
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <b>{ngo.name}</b> <br />
              Resources: {ngo.resources}
            </Tooltip>
          </Circle>
        ))}

        {/* Draw lines from hovered disaster to NGOs with distances */}
        {hoveredDisaster &&
          ngos.map((ngo) => {
            const distance = calculateDistance(hoveredDisaster.coords, ngo.coords).toFixed(2);
            return (
              <Polyline key={ngo.id} positions={[hoveredDisaster.coords, ngo.coords]} color="purple">
                <Tooltip direction="center" offset={[0, 0]} opacity={1}>
                  <b>{ngo.name}</b> <br />
                  Resources: {ngo.resources} <br />
                  Distance: {distance} km
                </Tooltip>
              </Polyline>
            );
          })}

        {/* Display Popup for Best NGO */}
        {bestNGO && hoveredDisaster && (
          <Popup position={hoveredDisaster.coords}>
            <div>
              <h3>Best NGO: {bestNGO.name}</h3>
              <p>Resources: {bestNGO.resources}</p>
              <p>Distance: {bestNGO.distance} km</p>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMapPage;

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";

function LocationMarker({ setLocation }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLocation(e.latlng);
        },
    });

    return position ? <Marker position={position} /> : null;
}

// 🔥 FIX FOR BROKEN MAP IN MODAL
function FixMapSize() {
    const map = useMap();

    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 200); // small delay after modal opens
    }, [map]);

    return null;
}

export default function MapPicker({ setLocation }) {
    return (
        <MapContainer
            center={[31.2001, 29.9187]}
            zoom={13}
            style={{
                height: "200px",
                width: "100%",
                borderRadius: 10,
                marginTop: 10
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationMarker setLocation={setLocation} />

            {/* 🔥 IMPORTANT FIX */}
            <FixMapSize />
        </MapContainer>
    );
}
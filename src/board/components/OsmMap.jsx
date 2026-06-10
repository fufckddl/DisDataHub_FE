import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./OsmMap.css";

// Leaflet 기본 마커 이미지 깨짐 방지
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// latitude, longitude 값이 바뀌었을 때 지도 중심 이동
function ChangeMapCenter({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined) {
      map.setView([Number(latitude), Number(longitude)], map.getZoom());
    }
  }, [latitude, longitude, map]);

  return null;
}

// 지도 클릭 이벤트
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      onLocationSelect({
        latitude: lat,
        longitude: lng,
      });
    },
  });

  return null;
}

function OsmMap({
  latitude,
  longitude,
  onLocationSelect,
  height = "400px",
  zoom = 15,
}) {
  const defaultPosition = [37.5665, 126.9780]; // 서울시청

  const hasPosition =
    latitude !== null &&
    latitude !== undefined &&
    latitude !== "" &&
    longitude !== null &&
    longitude !== undefined &&
    longitude !== "";

  const center = hasPosition
    ? [Number(latitude), Number(longitude)]
    : defaultPosition;

  return (
    <div className="osm-map-wrapper" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="osm-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeMapCenter latitude={latitude} longitude={longitude} />

        {onLocationSelect && (
          <MapClickHandler onLocationSelect={onLocationSelect} />
        )}

        {hasPosition && (
          <Marker position={[Number(latitude), Number(longitude)]}>
            <Popup>선택한 위치</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default OsmMap;
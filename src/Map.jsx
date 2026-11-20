import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const CENTRE = [3.139, 101.687]
const ATTRIBUTION = '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Has to sit inside the map to hear its clicks. It draws nothing
function Clicks({ hiding, onPick }) {
  useMapEvents({
    click: (event) => {
      if (hiding) onPick({ lat: event.latlng.lat, lng: event.latlng.lng })
    },
  })
  return null
}

export default function CacheMap({ caches, selectedId, hiding, spot, onSelect, onPick }) {
  const selected = caches.find((cache) => cache.id === selectedId)

  return (
    <MapContainer center={CENTRE} zoom={15} style={{ cursor: hiding ? 'crosshair' : undefined }}>
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={ATTRIBUTION} />
      <Clicks hiding={hiding} onPick={onPick} />

      {caches.map((cache) => (
        <CircleMarker
          key={cache.id}
          center={[cache.lat, cache.lng]}
          radius={11}
          className="pin"
          bubblingMouseEvents={false}
          eventHandlers={{ click: () => onSelect(cache.id) }}
        />
      ))}

      {/* A bigger ring drawn over the chosen pin. It ignores clicks, so the pin under it still gets them */}
      {selected && (
        <CircleMarker
          center={[selected.lat, selected.lng]}
          radius={15}
          className="chosen"
          interactive={false}
        />
      )}

      {spot && (
        <CircleMarker
          center={[spot.lat, spot.lng]}
          radius={11}
          className="spot"
          interactive={false}
        />
      )}
    </MapContainer>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TripPlace, Traveler } from '@/lib/types'

const placeColors: Record<TripPlace['type'], string> = {
  accommodation: '#7C5CBF',
  activity: '#E85D4C',
  restaurant: '#D4A853',
  transport: '#4A90B8',
  landmark: '#3D9A7D',
}

const createIcon = (type: TripPlace['type'], isSelected: boolean, index?: number) => {
  const color = placeColors[type]
  const size = isSelected ? 40 : 32
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        font-size: ${isSelected ? '14px' : '12px'};
        font-weight: 600;
        color: white;
        ${isSelected ? 'transform: scale(1.1); z-index: 1000 !important;' : ''}
      ">
        ${index !== undefined ? index + 1 : getIcon(type)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function getIcon(type: TripPlace['type']) {
  const icons: Record<TripPlace['type'], string> = {
    accommodation: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    activity: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    restaurant: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>`,
    transport: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/><polygon points="12 15 17 21 7 21 12 15"/></svg>`,
    landmark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
  }
  return icons[type]
}

interface MapViewProps {
  places: TripPlace[]
  selectedPlaceId?: string
  onPlaceSelect?: (id: string) => void
  travelers?: Traveler[]
}

function MapUpdater({ places, selectedPlaceId }: { places: TripPlace[], selectedPlaceId?: string }) {
  const map = useMap()
  const prevPlacesRef = useRef<TripPlace[]>([])
  
  useEffect(() => {
    if (places.length === 0) return
    
    const placesChanged = JSON.stringify(places.map(p => p.id)) !== JSON.stringify(prevPlacesRef.current.map(p => p.id))
    
    if (placesChanged) {
      const bounds = L.latLngBounds(places.map(p => [p.location.lat, p.location.lng]))
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
      prevPlacesRef.current = places
    } else if (selectedPlaceId) {
      const selected = places.find(p => p.id === selectedPlaceId)
      if (selected) {
        map.panTo([selected.location.lat, selected.location.lng], { animate: true })
      }
    }
  }, [places, selectedPlaceId, map])
  
  return null
}

export function TripMap({ places, selectedPlaceId, onPlaceSelect }: MapViewProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Loading map...</span>
      </div>
    )
  }
  
  const center = places.length > 0 
    ? [places[0].location.lat, places[0].location.lng] as [number, number]
    : [35.6762, 139.6503] as [number, number]
  
  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapUpdater places={places} selectedPlaceId={selectedPlaceId} />
      {places.map((place, index) => (
        <Marker
          key={place.id}
          position={[place.location.lat, place.location.lng]}
          icon={createIcon(place.type, place.id === selectedPlaceId, index)}
          eventHandlers={{
            click: () => onPlaceSelect?.(place.id),
          }}
        >
          <Popup>
            <div className="p-1 min-w-[140px]">
              <p className="font-semibold text-sm text-foreground">{place.name}</p>
              {place.location.address && (
                <p className="text-xs text-muted-foreground mt-0.5">{place.location.address}</p>
              )}
              {place.time && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {place.time}
                  {place.duration && ` · ${place.duration}`}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

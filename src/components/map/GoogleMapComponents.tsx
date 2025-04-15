import React from 'react';

// Add window type for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    [key: string]: any; // Add index signature for dynamic callback names
  }
}

// This component doesn't use the useJsApiLoader hook to avoid the useRef errors
interface MapWithMarkersProps {
  googleMapsApiKey: string;
  mapContainerStyle: { height: string; width: string };
  center: { lat: number; lng: number };
  zoom: number;
  onClick?: any;
  markerPosition?: { lat: number; lng: number };
  onLoad?: () => void;
}

interface MapState {
  error: string | null;
  isLoading: boolean;
}

/**
 * Extremely simplified and reliable Google Maps component using iframes
 */
const MapWithMarkers: React.FC<MapWithMarkersProps> = (props) => {
  const {
    googleMapsApiKey,
    mapContainerStyle,
    center,
    markerPosition,
    zoom,
    onLoad
  } = props;

  // Call onLoad when component mounts
  React.useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Make sure we have valid coordinates
  const validCenter = center && center.lat && center.lng 
    ? center 
    : { lat: 37.7749, lng: -122.4194 }; // Default to SF if not provided

  // Build the Google Maps iframe URL with proper parameters
  let mapUrl = '';
  
  // If we have marker position, use a place mode
  if (markerPosition && markerPosition.lat !== 0 && markerPosition.lng !== 0) {
    mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${markerPosition.lat},${markerPosition.lng}&zoom=${zoom}`;
  } else {
    // Otherwise use view mode with center
    mapUrl = `https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=${validCenter.lat},${validCenter.lng}&zoom=${zoom}`;
  }

  return (
    <div style={{ ...mapContainerStyle, position: 'relative' }}>
      <iframe
        width="100%"
        height="100%"
        style={{ 
          border: 0,
          borderRadius: '8px'
        }}
        loading="lazy"
        src={mapUrl}
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map"
      ></iframe>
      
      {/* Remove the overlay that was blocking interaction */}
      <div 
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          zIndex: 10,
          cursor: 'pointer'
        }}
        onClick={() => {
          // Open Google Maps in a new tab
          window.open(`https://www.google.com/maps/search/?api=1&query=${markerPosition ? `${markerPosition.lat},${markerPosition.lng}` : `${validCenter.lat},${validCenter.lng}`}`, '_blank');
        }}
      >
        Open in Google Maps
      </div>
    </div>
  );
};

export default MapWithMarkers; 
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripsAPI } from '../../api';
import { formatTime, formatDate } from '../../utils';
import { ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
// Static import required by Vite bundler — dynamic import of CSS doesn't work
import 'leaflet/dist/leaflet.css';

export default function BusTracking() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const mapRef      = useRef(null);
  const leafletMap  = useRef(null);
  const markerRef   = useRef(null);
  const intervalRef = useRef(null);
  const mountedRef  = useRef(true);

  const [trip,     setTrip]     = useState(null);
  const [location, setLocation] = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Fetch trip info
  useEffect(() => {
    mountedRef.current = true;
    tripsAPI.getById(id)
      .then(res => { if (mountedRef.current) setTrip(res.data.trip); })
      .catch(() => toast.error('Trip not found.'));
    return () => { mountedRef.current = false; };
  }, [id]);

  // Fetch location with polling
  const fetchLocation = async () => {
    try {
      const res = await tripsAPI.getLocation(id);
      if (mountedRef.current) {
        setLocation(res.data.location);
        setLoading(false);
      }
      return res.data.location;
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, 10_000);
    return () => clearInterval(intervalRef.current);
  }, [id]);

  // Init Leaflet map once the container div mounts
  useEffect(() => {
    if (!mapRef.current) return;

    import('leaflet').then(({ default: L }) => {
      if (leafletMap.current || !mapRef.current) return;

      // Fix default marker icon paths broken by bundlers
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [6.5244, 3.3792], // Lagos
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMap.current = map;

      // Expose L for later use
      mapRef.current._L = L;
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markerRef.current  = null;
      }
    };
  }, []);

  // Update marker when location changes
  useEffect(() => {
    if (!leafletMap.current || !location) return;
    const L = mapRef.current?._L;
    if (!L) return;

    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    const busIcon = L.divIcon({
      html: `<div style="background:#ea580c;color:#fff;border-radius:50%;width:36px;height:36px;
                        display:flex;align-items:center;justify-content:center;font-size:18px;
                        box-shadow:0 2px 8px rgba(234,88,12,.5);border:3px solid white;">🚌</div>`,
      className: '',
      iconSize:   [36, 36],
      iconAnchor: [18, 18],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: busIcon })
        .addTo(leafletMap.current)
        .bindPopup(`<strong>Langra Trans Bus</strong><br>Updated: ${new Date(location.recorded_at).toLocaleTimeString()}`);
    }

    leafletMap.current.setView([lat, lng], 15);
  }, [location]);

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="bg-dark-800 px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white text-sm truncate">
            {trip?.route_name || 'Live Bus Tracking'}
          </p>
          {trip && (
            <p className="text-slate-400 text-xs flex items-center gap-1">
              <Clock size={10} /> {formatTime(trip.departure_time)} · {formatDate(trip.travel_date)}
            </p>
          )}
        </div>
        <button onClick={fetchLocation} className="text-slate-400 hover:text-white" aria-label="Refresh">
          <RefreshCw size={17} />
        </button>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Status overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
          {loading ? (
            <div className="bg-dark-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 text-white text-sm flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" /> Fetching bus location…
            </div>
          ) : !location ? (
            <div className="bg-dark-800/90 backdrop-blur-sm rounded-2xl px-4 py-3">
              <p className="text-white font-semibold text-sm">Tracking not active</p>
              <p className="text-slate-400 text-xs mt-0.5">Location sharing has not started for this trip.</p>
            </div>
          ) : (
            <div className="bg-dark-800/90 backdrop-blur-sm rounded-2xl px-4 py-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-white font-semibold text-sm">Bus is live</p>
              </div>
              <p className="text-slate-400 text-xs">
                Updated {new Date(location.recorded_at).toLocaleTimeString()}
                {location.speed_kmh ? ` · ${Math.round(location.speed_kmh)} km/h` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

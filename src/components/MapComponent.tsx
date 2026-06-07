/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Map as MapIcon, Layers, Compass, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TouristSpot } from '../types';
import { KEDAH_DISTRICTS } from '../data/spots';

// District coordinate approximations relative to Kedah's geographical center for visual plotting
// Used to render a beautiful layout representing Kedah
export const DISTRICT_MAP_COORDS: Record<string, { x: number; y: number; originalName: string }> = {
  'Langkawi': { x: 12, y: 18, originalName: 'Langkawi (Pulau)' },
  'Kubang Pasu': { x: 42, y: 14, originalName: 'Kubang Pasu' },
  'Padang Terap': { x: 74, y: 22, originalName: 'Padang Terap' },
  'Pokok Sena': { x: 50, y: 32, originalName: 'Pokok Sena' },
  'Kota Setar': { x: 34, y: 34, originalName: 'Kota Setar' },
  'Pendang': { x: 48, y: 48, originalName: 'Pendang' },
  'Yan': { x: 28, y: 56, originalName: 'Yan (Gunung Jerai)' },
  'Kuala Muda': { x: 38, y: 70, originalName: 'Kuala Muda' },
  'Sik': { x: 72, y: 52, originalName: 'Sik (Hutan & Tasik)' },
  'Baling': { x: 82, y: 72, originalName: 'Baling (Pergunungan)' },
  'Kulim': { x: 44, y: 88, originalName: 'Kulim' },
  'Bandar Baharu': { x: 42, y: 98, originalName: 'Bandar Baharu' },
};

interface MapComponentProps {
  spots: TouristSpot[];
  selectedSpot: TouristSpot | null;
  onSelectSpot: (spot: TouristSpot) => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
}

export default function MapComponent({
  spots,
  selectedSpot,
  onSelectSpot,
  selectedDistrict,
  onSelectDistrict,
}: MapComponentProps) {
  const [mapType, setMapType] = useState<'vector' | 'satellite'>('vector');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [leafletError, setLeafletError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Leaflet dynamic scripts for the satellite/actual street map
  useEffect(() => {
    if (mapType !== 'satellite') return;

    let isMounted = true;

    const loadLeaflet = async () => {
      // Check if already loaded
      if ((window as any).L) {
        if (isMounted) setLeafletLoaded(true);
        return;
      }

      try {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        
        script.onload = () => {
          if (isMounted) setLeafletLoaded(true);
        };
        script.onerror = () => {
          if (isMounted) setLeafletError(true);
        };

        document.body.appendChild(script);
      } catch (err) {
        if (isMounted) setLeafletError(true);
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
    };
  }, [mapType]);

  // Handle Leaflet Map Initialization and updates
  useEffect(() => {
    if (mapType !== 'satellite' || !leafletLoaded || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Default center of Kedah if no spot is selected
    const initialLat = selectedSpot ? selectedSpot.coordinates.lat : 6.1211;
    const initialLng = selectedSpot ? selectedSpot.coordinates.lng : 100.3661;
    const initialZoom = selectedSpot ? 13 : 9;

    // Re-create the map container element in the DOM to avoid Leaflet double initialization bugs
    const container = mapContainerRef.current;
    container.innerHTML = `<div id="live-leaflet-map" class="w-full h-full rounded-xl overflow-hidden shadow-inner bg-slate-100 min-h-[400px]"></div>`;

    try {
      const map = L.map('live-leaflet-map').setView([initialLat, initialLng], initialZoom);
      leafletMapInstanceRef.current = map;

      // Add a warm high-contrast Tile Layer (using OpenStreetMap with nice contrast)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Create pin markers for all spots
      markersRef.current = [];
      spots.forEach((spot) => {
        const isCurrent = selectedSpot?.id === spot.id;
        
        // Custom colored circle marker or pin
        const markerColor = isCurrent ? '#047857' : '#d97706'; // emerald vs amber
        const customMarker = L.circleMarker([spot.coordinates.lat, spot.coordinates.lng], {
          radius: isCurrent ? 12 : 8,
          fillColor: markerColor,
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.8,
        }).addTo(map);

        // Bind gorgeous popups
        customMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #064e3b; font-size: 14px;">${spot.name}</strong><br/>
            <span style="color: #6b7280; font-size: 11px;">${spot.district} &bull; ${spot.openingHours}</span><br/>
            <div style="margin-top: 5px; color: #b45309; font-weight: bold; font-size: 12px;">Harga Tiket: ${spot.ticketPriceAdultMyKad === 0 ? 'Percuma' : `RM${spot.ticketPriceAdultMyKad}`}</div>
          </div>
        `);

        // Click handler to select spot on the React side
        customMarker.on('click', () => {
          onSelectSpot(spot);
        });

        markersRef.current.push({ id: spot.id, marker: customMarker, latLng: [spot.coordinates.lat, spot.coordinates.lng] });
      });

      // Fit bounds if no spot is selected to show all spots
      if (!selectedSpot && spots.length > 0) {
        const group = new L.featureGroup(spots.map(s => L.marker([s.coordinates.lat, s.coordinates.lng])));
        map.fitBounds(group.getBounds().pad(0.15));
      }
    } catch (e) {
      console.error("Leaflet init error:", e);
    }

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, mapType, spots, selectedSpot]);

  // Fly to selected spot
  useEffect(() => {
    if (mapType !== 'satellite' || !leafletMapInstanceRef.current || !selectedSpot) return;

    const map = leafletMapInstanceRef.current;
    map.flyTo([selectedSpot.coordinates.lat, selectedSpot.coordinates.lng], 13, {
      duration: 1.5,
      easeLinearity: 0.25,
    });

    // Find and open marker popup
    const targetMarkerInfo = markersRef.current.find(m => m.id === selectedSpot.id);
    if (targetMarkerInfo && targetMarkerInfo.marker) {
      setTimeout(() => {
        targetMarkerInfo.marker.openPopup();
      }, 1600);
    }
  }, [selectedSpot, mapType]);

  const activeSpots = selectedDistrict === 'Semua' 
    ? spots 
    : spots.filter(s => s.district === selectedDistrict);

  return (
    <div id="interactive-map-panel" className="bg-white rounded-2xl border border-emerald-100/80 p-5 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Map Header and Switch Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-50/80 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-950 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            Peta Interaktif Pelancongan Kedah
          </h2>
          <p className="text-xs text-emerald-700 mt-0.5">
            {mapType === 'vector' 
              ? 'Terokai mengikut daerah geografi negeri Kedah' 
              : 'Klik pada penanda peta untuk meneroka koordinat sebenar bumi'}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-emerald-50/50 p-1 rounded-xl self-start sm:self-center border border-emerald-100/50">
          <button
            id="map-vector-view-btn"
            onClick={() => setMapType('vector')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapType === 'vector'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Peta Daerah (Vector)
          </button>
          <button
            id="map-satellite-view-btn"
            onClick={() => setMapType('satellite')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mapType === 'satellite'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/40'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Peta Standard Live
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 min-h-[420px] rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50/20 to-lime-50/10">
        
        {/* VECTOR MAP PANEL */}
        <AnimatePresence mode="wait">
          {mapType === 'vector' && (
            <motion.div
              key="vector-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col md:flex-row gap-4 p-2 h-full overflow-y-auto lg:overflow-hidden md:h-auto md:min-h-full"
            >
              {/* Left Column: Visual Map representation of Kedah */}
              <div className="flex-1 relative border border-emerald-100/40 bg-emerald-50/10 rounded-xl p-4 flex flex-col justify-between overflow-hidden min-h-[300px]">
                
                {/* Guide watermark & Compass rose */}
                <div className="absolute top-4 right-4 pointer-events-none opacity-10 flex flex-col items-center">
                  <div className="w-16 h-16 border-2 border-dashed border-emerald-950 rounded-full flex items-center justify-center">
                    <div className="text-xl font-bold font-mono tracking-widest text-emerald-950">N</div>
                  </div>
                </div>

                {/* Legend bar */}
                <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 pointer-events-none bg-white/90 p-2.5 rounded-lg border border-emerald-100 shadow-sm text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-sm"></span>
                    <span className="font-medium text-emerald-900">Tempat Terpilih</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm"></span>
                    <span className="font-medium text-amber-900">Tempat Pelancongan Kedah</span>
                  </div>
                  <div className="text-[9px] text-emerald-600 mt-1 italic">
                    *Susun atur geografi dipermudah untuk navigasi interaktif.
                  </div>
                </div>

                {/* Dynamic SVG Kedah Vector layout representing districts */}
                <div className="w-full h-full min-h-[280px] flex items-center justify-center relative select-none mt-2">
                  <svg viewBox="0 0 100 110" className="w-full h-full max-h-[340px] drop-shadow-lg">
                    {/* Background state contour lines */}
                    <path
                      d="M 38 10 C 58 8, 80 18, 88 32 C 95 48, 84 80, 75 90 C 60 108, 48 100, 36 102 C 26 95, 20 80, 24 64 C 28 50, 26 30, 32 20 Z"
                      fill="rgba(16, 185, 129, 0.03)"
                      stroke="rgba(16, 185, 129, 0.1)"
                      strokeWidth="0.5"
                    />

                    {/* Render Interactive Districts as responsive elements */}
                    {Object.entries(DISTRICT_MAP_COORDS).map(([name, coords]) => {
                      const isActiveDistrict = selectedDistrict === name;
                      const hasSpotsInDistrict = spots.some((s) => s.district === name);
                      const activeSpotInThisDistrict = selectedSpot?.id && spots.find(s => s.id === selectedSpot.id)?.district === name;

                      let boxBg = 'rgba(255, 255, 255, 0.75)';
                      let strokeColor = 'rgba(16, 185, 129, 0.2)';
                      let textColor = 'text-emerald-900';

                      if (isActiveDistrict) {
                        boxBg = '#065f46'; // deep emerald
                        strokeColor = '#047857';
                        textColor = 'text-white';
                      } else if (activeSpotInThisDistrict) {
                        boxBg = 'rgba(16, 185, 129, 0.15)';
                        strokeColor = '#10b981';
                        textColor = 'text-emerald-950 font-semibold';
                      } else if (hasSpotsInDistrict) {
                        boxBg = 'rgba(251, 191, 36, 0.1)'; // subtle amber
                        strokeColor = 'rgba(251, 191, 36, 0.4)';
                      }

                      return (
                        <g 
                          id={`district-node-${name.replace(/\s+/g, '-').toLowerCase()}`}
                          key={name} 
                          className="cursor-pointer" 
                          onClick={() => onSelectDistrict(name)}
                        >
                          {/* Animated background shape outline per district */}
                          <circle
                            cx={coords.x}
                            cy={coords.y}
                            r={name === 'Langkawi' ? 12 : 9}
                            fill={boxBg}
                            stroke={strokeColor}
                            strokeWidth={isActiveDistrict ? '1.5' : '0.8'}
                            style={{ transition: 'all 0.3s ease' }}
                          />

                          {/* District Name Text Label */}
                          <text
                            x={coords.x}
                            y={coords.y + 1.5}
                            textAnchor="middle"
                            fontSize={name === 'Langkawi' ? '3.2' : '2.5'}
                            className={`font-semibold tracking-wider font-mono fill-emerald-950 transition-colors pointer-events-none`}
                            style={{ 
                              fill: isActiveDistrict ? '#ffffff' : '#022c22',
                              fontWeight: isActiveDistrict ? 'bold' : 'normal'
                            }}
                          >
                            {name}
                          </text>

                          {/* Tourism spot markers anchored inside this district */}
                          {spots
                            .filter((spot) => spot.district === name)
                            .map((spot, spotIdx) => {
                              const isThisSpotSelected = selectedSpot?.id === spot.id;
                              
                              // Offset markers around the district node center
                              const angle = (spotIdx * 2 * Math.PI) / spots.filter((s) => s.district === name).length || 0;
                              const radiusOffset = name === 'Langkawi' ? 7 : 5.8;
                              const mX = coords.x + radiusOffset * Math.cos(angle);
                              const mY = coords.y + radiusOffset * Math.sin(angle);

                              return (
                                <g 
                                  id={`spot-marker-${spot.id}`}
                                  key={spot.id} 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectSpot(spot);
                                  }}
                                >
                                  {/* Ripple back drop behind the selected spot */}
                                  {isThisSpotSelected && (
                                    <circle
                                      cx={mX}
                                      cy={mY}
                                      r="4.5"
                                      fill="rgba(16, 185, 129, 0.3)"
                                      className="animate-ping"
                                      style={{ transformOrigin: `${mX}px ${mY}px` }}
                                    />
                                  )}
                                  
                                  {/* Interactive spot marker pin */}
                                  <circle
                                    cx={mX}
                                    cy={mY}
                                    r={isThisSpotSelected ? '2.8' : '1.8'}
                                    fill={isThisSpotSelected ? '#10b981' : '#f59e0b'}
                                    stroke="#ffffff"
                                    strokeWidth="0.4"
                                    className="hover:scale-150 transition-transform"
                                  />
                                </g>
                              );
                            })}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right Column: Visual Hotspot Quick Info Cards based on Filters */}
              <div className="w-full md:w-64 border border-emerald-100/40 bg-emerald-50/5/20 rounded-xl p-3 flex flex-col justify-start">
                <span className="text-[10px] font-mono tracking-widest text-emerald-800 uppercase block mb-2 px-1">
                  Tempat di {selectedDistrict}:
                </span>
                
                <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-[300px] md:max-h-[340px]">
                  {activeSpots.length === 0 ? (
                    <div className="text-center py-8 text-emerald-600/75 text-xs bg-white rounded-lg border border-dashed border-emerald-100 p-4">
                      Tiada tempat tersenarai bagi daerah ini buat masa kini. Sila pilih daerah lain seperti Alor Setar atau Langkawi!
                    </div>
                  ) : (
                    activeSpots.map((spot) => {
                      const isSelected = selectedSpot?.id === spot.id;
                      return (
                        <div
                          id={`quick-map-card-${spot.id}`}
                          key={spot.id}
                          onClick={() => onSelectSpot(spot)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 shadow-sm outline outline-1 outline-emerald-500'
                              : 'bg-white hover:bg-emerald-50/20 border-emerald-100/60'
                          }`}
                        >
                          <div className="flex gap-2 items-start">
                            <img
                              src={spot.imageUrl}
                              alt={spot.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-emerald-950 truncate">{spot.name}</h4>
                              <p className="text-[9px] text-emerald-700/80 truncate">{spot.location}</p>
                              <div className="mt-1 flex items-center justify-between text-[10px]">
                                <span className="font-mono text-amber-700 font-bold">
                                  {spot.ticketPriceAdultMyKad === 0 ? 'Percuma' : `RM${spot.ticketPriceAdultMyKad}`}
                                </span>
                                <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-medium">
                                  {spot.district}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Show All District Toggle inside filter column */}
                {selectedDistrict !== 'Semua' && (
                  <button
                    id="reset-district-filter-btn"
                    onClick={() => onSelectDistrict('Semua')}
                    className="mt-3 w-full border border-emerald-200 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Papar Semua Daerah
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* REAL SATELLITE/STREET MAP PANEL */}
          {mapType === 'satellite' && (
            <motion.div
              key="satellite-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col h-full overflow-hidden p-1"
            >
              {!leafletLoaded && !leafletError && (
                <div id="map-loading-indicator" className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-slate-50 gap-3 border border-emerald-100">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-emerald-800 font-medium">Memuat turun data satelit peta...</p>
                </div>
              )}

              {leafletError && (
                <div id="map-error-indicator" className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-red-50 text-red-800 p-6 border border-red-200 text-center">
                  <MapIcon className="w-12 h-12 text-red-400 mb-2" />
                  <p className="font-semibold">Map Loading Failed</p>
                  <p className="text-xs text-red-600/80 mt-1 max-w-sm">
                    Gagal memuat turun data peta dari rangkaian terbuka. Anda masih boleh menggunakan mod <strong>Peta Daerah (Vector)</strong> yang interaktif secara terbina!
                  </p>
                  <button
                    id="switch-back-vector-btn"
                    onClick={() => setMapType('vector')}
                    className="mt-4 bg-emerald-600 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-700 transition"
                  >
                    Kembali ke Peta Vector
                  </button>
                </div>
              )}

              {/* DOM container node for dynamic map rendering */}
              <div 
                ref={mapContainerRef} 
                className="w-full h-full min-h-[380px] rounded-xl overflow-hidden shadow-inner"
              />

              {/* Floating control bar overlay */}
              {selectedSpot && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm shadow border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between z-[1000] text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 animate-bounce" />
                    <div className="min-w-0">
                      <p className="font-semibold text-emerald-950 truncate">{selectedSpot.name}</p>
                      <p className="text-[10px] text-emerald-700/80 truncate">Lat: {selectedSpot.coordinates.lat}, Lng: {selectedSpot.coordinates.lng}</p>
                    </div>
                  </div>
                  <a
                    id="gmaps-external-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.coordinates.lat},${selectedSpot.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 text-white font-medium hover:bg-emerald-700 px-3 py-1.5 rounded-md text-[10px] flex items-center gap-1 flex-shrink-0 shadow-sm transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    Penunjuk Arah GPS
                  </a>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

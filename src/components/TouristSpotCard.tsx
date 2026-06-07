/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { MapPin, Clock, Info, CheckCircle, Map, Ticket } from 'lucide-react';
import { TouristSpot, Category } from '../types';

interface TouristSpotCardProps {
  key?: string;
  spot: TouristSpot;
  isSelected: boolean;
  onSelect: () => void;
  onSelectOnMap: () => void;
}

const CATEGORY_LABELS: Record<Category, { label: string; color: string; bg: string }> = {
  'Heritage': { label: 'Seni, Budaya & Warisan', color: 'text-amber-800 border-amber-200', bg: 'bg-amber-50' },
  'Nature': { label: 'Eko-Pelancongan & Alam Semula Jadi', color: 'text-emerald-800 border-emerald-200', bg: 'bg-emerald-50' },
  'Beach': { label: 'Pulau, Pantai & Rekreasi Air', color: 'text-sky-800 border-sky-200', bg: 'bg-sky-50' },
  'Family': { label: 'Keluarga, Sukan & Hiburan', color: 'text-purple-800 border-purple-200', bg: 'bg-purple-50' },
};

export default function TouristSpotCard({
  spot,
  isSelected,
  onSelect,
  onSelectOnMap,
}: TouristSpotCardProps) {
  const cat = CATEGORY_LABELS[spot.category] || { label: spot.category, color: 'text-gray-800 border-gray-200', bg: 'bg-gray-50' };

  return (
    <div
      id={`tourist-spot-card-${spot.id}`}
      onClick={onSelect}
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
          : 'border-emerald-100/60 hover:border-emerald-300 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Banner Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={spot.imageUrl}
            alt={spot.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Category Badge absolute */}
          <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full border shadow-sm ${cat.bg} ${cat.color}`}>
            {cat.label}
          </span>

          {/* District overlay bottom-right */}
          <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm shadow border border-emerald-100/50 text-[10px] text-emerald-950 font-bold px-2 py-0.5 rounded">
            {spot.district}
          </span>
        </div>

        {/* Card Info padding */}
        <div className="p-4.5">
          <h3 className="text-sm font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-tight">
            {spot.name}
          </h3>
          
          <p className="text-xs text-emerald-900/70 mt-1.5 leading-relaxed line-clamp-3">
            {spot.description}
          </p>

          {/* Metadata Highlights */}
          <div className="mt-4 space-y-1.5 pt-3.5 border-t border-emerald-50 text-[11px] text-slate-500 font-medium">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-slate-600 truncate">{spot.location}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="text-slate-600">{spot.openingHours}</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50/50 p-1.5 rounded border border-amber-100/45">
              <Ticket className="w-3.5 h-3.5" />
              <span>Tiket Dewasa (MyKad): {spot.ticketPriceAdultMyKad === 0 ? 'Percuma' : `RM ${spot.ticketPriceAdultMyKad}`}</span>
            </div>
          </div>

          {/* Bullet Highlight Features */}
          <div className="mt-3.5 flex flex-wrap gap-1">
            {spot.features.slice(0, 3).map((feat, idx) => (
              <span key={idx} className="text-[9px] bg-slate-100/85 text-slate-700 px-2 py-0.5 rounded flex items-center gap-1 font-medium border border-slate-200/50">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                {feat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Button Action bar */}
      <div className="p-4 bg-emerald-50/30 border-t border-emerald-50 flex gap-2">
        <button
          id={`focus-map-btn-${spot.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelectOnMap();
          }}
          className="flex-1 bg-white hover:bg-emerald-50/50 text-emerald-800 font-semibold text-[11px] py-2 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Map className="w-3.5 h-3.5" />
          Fokus di Peta
        </button>
        
        <button
          id={`select-card-btn-${spot.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className={`px-3.5 py-2 font-semibold text-[11px] rounded-xl border transition-all cursor-pointer ${
            isSelected
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white border-emerald-200 text-emerald-950 hover:bg-emerald-50/50'
          }`}
        >
          Detail
        </button>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Wallet, Check, Ticket, User, Users, Trash2, PlusCircle, ArrowRight } from 'lucide-react';
import { TouristSpot } from '../types';

interface TicketCalculatorProps {
  spots: TouristSpot[];
  selectedSpot: TouristSpot | null;
  onSelectSpot: (spot: TouristSpot) => void;
}

export default function TicketCalculator({
  spots,
  selectedSpot,
  onSelectSpot,
}: TicketCalculatorProps) {
  // Budget calculator inputs
  const [basket, setBasket] = useState<string[]>(
    selectedSpot ? [selectedSpot.id] : [spots[0]?.id].filter(Boolean)
  );
  const [adultCount, setAdultCount] = useState<number>(2);
  const [childCount, setChildCount] = useState<number>(2);
  const [isForeigner, setIsForeigner] = useState<boolean>(false);

  // Auto-add selectedSpot to calculation basket if it is not in there yet
  const handleAddCurrentToBasket = () => {
    if (selectedSpot && !basket.includes(selectedSpot.id)) {
      setBasket((prev) => [...prev, selectedSpot.id]);
    }
  };

  const handleToggleSpot = (id: string) => {
    setBasket((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  // Calculate costs
  const chosenSpots = spots.filter((s) => basket.includes(s.id));
  
  const adultPriceField = isForeigner ? 'ticketPriceAdultForeigner' : 'ticketPriceAdultMyKad';
  const childPriceField = isForeigner ? 'ticketPriceChildForeigner' : 'ticketPriceChildMyKad';

  const totalAdultCost = chosenSpots.reduce((sum, spot) => sum + (spot[adultPriceField] * adultCount), 0);
  const totalChildCost = chosenSpots.reduce((sum, spot) => sum + (spot[childPriceField] * childCount), 0);
  const grandTotal = totalAdultCost + totalChildCost;

  return (
    <div id="ticket-calculator-panel" className="bg-white rounded-2xl border border-amber-100/80 p-5 shadow-sm flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-50 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-amber-950">Kalkulator Belanjawan Tiket</h3>
              <p className="text-[11px] text-amber-800">Rancang bajet tiket pas masuk kumpulan anda</p>
            </div>
          </div>
          
          <button
            id="clear-basket-btn"
            onClick={handleClearBasket}
            className="text-amber-800 hover:text-red-700 hover:bg-red-50 text-[10px] font-medium px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Kosongkan
          </button>
        </div>

        {/* Citizenship switch */}
        <div className="grid grid-cols-2 gap-2 bg-amber-50/50 p-1 rounded-xl border border-amber-100/50 mb-4">
          <button
            id="citizen-mykad-btn"
            type="button"
            onClick={() => setIsForeigner(false)}
            className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              !isForeigner
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-950 hover:bg-amber-100/30'
            }`}
          >
            Warganegara (MyKad)
          </button>
          <button
            id="citizen-foreigner-btn"
            type="button"
            onClick={() => setIsForeigner(true)}
            className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isForeigner
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-950 hover:bg-amber-100/30'
            }`}
          >
            Pelancong Asing (Standard)
          </button>
        </div>

        {/* Quantities input */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-amber-50/20 rounded-xl p-3 border border-amber-100/30">
            <label className="text-[11px] font-medium text-amber-950 block mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-600" />
              Bilangan Dewasa
            </label>
            <div className="flex items-center justify-between">
              <button
                id="dec-adult-btn"
                type="button"
                onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                className="w-7 h-7 bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 rounded-lg flex items-center justify-center font-bold text-xs"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-amber-950">{adultCount}</span>
              <button
                id="inc-adult-btn"
                type="button"
                onClick={() => setAdultCount(Math.min(99, adultCount + 1))}
                className="w-7 h-7 bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 rounded-lg flex items-center justify-center font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-amber-50/20 rounded-xl p-3 border border-amber-100/30">
            <label className="text-[11px] font-medium text-amber-950 block mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              Bilangan Kanak-kanak
            </label>
            <div className="flex items-center justify-between">
              <button
                id="dec-child-btn"
                type="button"
                onClick={() => setChildCount(Math.max(0, childCount - 1))}
                className="w-7 h-7 bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 rounded-lg flex items-center justify-center font-bold text-xs"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-amber-950">{childCount}</span>
              <button
                id="inc-child-btn"
                type="button"
                onClick={() => setChildCount(Math.min(99, childCount + 1))}
                className="w-7 h-7 bg-white hover:bg-amber-50 text-amber-950 border border-amber-200 rounded-lg flex items-center justify-center font-bold text-xs"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Selected Spot Quick Adder Helper */}
        {selectedSpot && !basket.includes(selectedSpot.id) && (
          <div id="quick-add-bubble" className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-100 border-dashed text-[11px] flex items-center justify-between mb-4">
            <span className="text-amber-950 truncate max-w-[150px]">
              Tambah <strong>{selectedSpot.name}</strong> ke bajet?
            </span>
            <button
              id="add-selected-to-calc-btn"
              onClick={handleAddCurrentToBasket}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-2 py-1 rounded flex items-center gap-1 text-[10px] cursor-pointer"
            >
              <PlusCircle className="w-3 h-3" />
              Tambah Sekarang
            </button>
          </div>
        )}

        {/* Spot List Checklist */}
        <span className="text-[10px] font-mono tracking-widest text-amber-900 uppercase block mb-2 px-1">
          Senarai Tempat pilihan ({basket.length}):
        </span>

        <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1 mb-4 select-none">
          {spots.map((spot) => {
            const isChecked = basket.includes(spot.id);
            const adultPrice = isForeigner ? spot.ticketPriceAdultForeigner : spot.ticketPriceAdultMyKad;
            const childPrice = isForeigner ? spot.ticketPriceChildForeigner : spot.ticketPriceChildMyKad;
            const hasFee = adultPrice > 0 || childPrice > 0;

            return (
              <div
                id={`calculator-checkbox-${spot.id}`}
                key={spot.id}
                onClick={() => handleToggleSpot(spot.id)}
                className={`flex items-center justify-between p-2 rounded-xl text-left border cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-amber-500/5 border-amber-400'
                    : 'bg-white border-amber-100/40 hover:bg-amber-50/25'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-4 h-4 rounded flex items-shrink-0 items-center justify-center border transition-all ${
                    isChecked
                      ? 'bg-amber-600 border-amber-600'
                      : 'border-amber-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-amber-950 truncate">{spot.name}</h4>
                    <p className="text-[9px] text-amber-700/80 truncate">
                      {spot.district} &bull; {hasFee ? `RM${adultPrice} d / RM${childPrice} k` : 'Percuma'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold font-mono text-amber-900 flex-shrink-0 ml-2">
                  {hasFee 
                    ? `+RM${(adultPrice * adultCount) + (childPrice * childCount)}`
                    : 'Percuma'
                  }
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grand Total Box Panel */}
      <div className="bg-amber-600 text-white rounded-xl p-4 shadow-sm mt-2">
        <div className="flex items-center justify-between border-b border-amber-500/50 pb-2.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4" />
            <span className="text-xs font-medium tracking-wide">Ringkasan Kos</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 font-mono">
            {isForeigner ? 'Pelancong Asing' : 'MyKad'}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-amber-100/90 font-medium">
          <div className="flex items-center justify-between">
            <span>Dewasa ({adultCount} pax):</span>
            <span className="font-mono">RM {totalAdultCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Kanak-kanak ({childCount} pax):</span>
            <span className="font-mono">RM {totalChildCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-amber-500/40 pt-2.5 mt-2.5 text-white font-bold text-sm">
            <span className="flex items-center gap-1 text-xs">
              <Wallet className="w-4 h-4" />
              Jumlah Anggaran Bajet :
            </span>
            <span className="font-mono text-lg">RM {grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {basket.length > 0 ? (
          <p className="text-[9px] text-amber-100 mt-2.5 text-center italic leading-tight">
            *Anggaran berdasarkan harga tiket masuk rasmi terkini. Sila sedia wang tunai/kad pembayaran fizikal di kaunter masuk.
          </p>
        ) : (
          <p className="text-[9px] text-amber-100 mt-2.5 text-center leading-tight">
            *Sila tanda sekurang-kurangnya satu tempat pelancongan di senarai untuk mengira kos.
          </p>
        )}
      </div>
    </div>
  );
}

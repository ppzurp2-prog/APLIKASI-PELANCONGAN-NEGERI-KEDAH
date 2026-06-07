/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Compass, 
  MapPin, 
  Filter, 
  Ticket, 
  Award, 
  ArrowRight, 
  Utensils, 
  CheckCircle,
  HelpCircle,
  PlaneTakeoff,
  Clock,
  Navigation
} from 'lucide-react';

import { TOURIST_SPOTS, KEDAH_DISTRICTS } from './data/spots';
import { TouristSpot, Category } from './types';

// Importing our newly created modular subcomponents
import MapComponent from './components/MapComponent';
import TicketCalculator from './components/TicketCalculator';
import AiAssistant from './components/AiAssistant';
import TouristSpotCard from './components/TouristSpotCard';

export default function App() {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(TOURIST_SPOTS[0]?.id || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Semua'>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFaq, setShowFaq] = useState<boolean>(false);

  // Retrieve active spot details
  const selectedSpot = useMemo(() => {
    return TOURIST_SPOTS.find((s) => s.id === selectedSpotId) || null;
  }, [selectedSpotId]);

  // Apply search query, category, and district selection filters
  const filteredSpots = useMemo(() => {
    return TOURIST_SPOTS.filter((spot) => {
      const matchesSearch = 
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDistrict = selectedDistrict === 'Semua' || spot.district === selectedDistrict;
      const matchesCategory = selectedCategory === 'Semua' || spot.category === selectedCategory;

      return matchesSearch && matchesDistrict && matchesCategory;
    });
  }, [searchQuery, selectedDistrict, selectedCategory]);

  const handleSelectSpot = (spot: TouristSpot) => {
    setSelectedSpotId(spot.id);
  };

  const handleFocusSpotOnMap = (spot: TouristSpot) => {
    setSelectedSpotId(spot.id);
    // Find map container tab or section and smoothly scroll it into focus on mobile
    const mapElement = document.getElementById('interactive-map-panel');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div id="kedah-tourism-app" className="min-h-screen bg-slate-50/70 text-slate-800 font-sans antialiased pb-16 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Banner and Brand Navbar Grid */}
      <header className="relative bg-emerald-950 text-white overflow-hidden py-10 px-4 sm:px-6 lg:px-8 border-b-4 border-amber-500">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        {/* Abstract rice stalk illustration or ambient glow */}
        <div className="absolute top-1/2 left-3/4 -translate-y-1/2 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="bg-amber-500/25 border border-amber-500/50 text-amber-400 font-mono text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                Jelapang Padi Malaysia 🌾
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-2 max-w-xl">
              Portal Pelancongan Kedah Darul Aman
            </h1>
            <p className="text-sm text-emerald-100/90 max-w-2xl font-medium leading-relaxed">
              Panduan interaktif pelancongan maya negeri Kedah. Semak harga tiket terkini, terokai peta daerah, kalkulasi kos percutian, dan berbual dengan Pembantu AI pelancongan kami.
            </p>
          </div>

          {/* Quick Statistics Stats Banner */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto flex-shrink-0 bg-emerald-900/60 p-4 rounded-2xl border border-emerald-800 backdrop-blur-sm shadow-sm md:min-w-[320px]">
            <div className="text-center px-1">
              <span className="block text-2xl font-extrabold font-display text-amber-400">12</span>
              <span className="text-[10px] text-emerald-200/90 font-medium font-mono uppercase tracking-wide">Daerah Utama</span>
            </div>
            <div className="text-center border-l border-emerald-800 px-1">
              <span className="block text-2xl font-extrabold font-display text-amber-400">100%</span>
              <span className="text-[10px] text-emerald-200/90 font-medium font-mono uppercase tracking-wide">Peta Interaktif</span>
            </div>
            <div className="text-center border-l border-emerald-800 px-1">
              <span className="block text-2xl font-extrabold font-display text-amber-400">RM 0+</span>
              <span className="text-[10px] text-emerald-200/90 font-medium font-mono uppercase tracking-wide">Tiket Mampu</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Navigation Filters & Search Panel */}
        <section id="filters-section" className="bg-white rounded-2xl p-5 border border-emerald-100/80 shadow-sm mb-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-800/50" />
              <input
                id="search-attractions"
                type="text"
                placeholder="Cari pusat peranginan, muzium, daerah, atau nama tempat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-emerald-100 bg-emerald-50/10 placeholder-emerald-800/40 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 transition-all font-medium text-emerald-950"
              />
            </div>

            {/* Quick District Dropdown Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="district-select" className="text-xs font-semibold text-emerald-900 flex items-center gap-1 flex-shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Daerah:
              </label>
              <select
                id="district-select"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-emerald-50/50 hover:bg-emerald-100/40 border border-emerald-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-950 outline-none transition cursor-pointer"
              >
                <option value="Semua">Semua 12 Daerah</option>
                {KEDAH_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filters Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none border-t border-emerald-50 pt-3">
            <span className="text-xs font-bold text-emerald-900 mr-1.5 flex-shrink-0">
              Kategori:
            </span>
            <div className="flex gap-1.5">
              {(['Semua', 'Nature', 'Beach', 'Heritage', 'Family'] as const).map((cat) => {
                const isSelected = selectedCategory === cat;
                const spotCountInThisCategory = cat === 'Semua' 
                  ? TOURIST_SPOTS.length 
                  : TOURIST_SPOTS.filter(s => s.category === cat).length;

                // Human translation labels
                let label = 'Semua Kategori';
                if (cat === 'Nature') label = '🌿 Semulajadi & Rekreasi';
                if (cat === 'Beach') label = '🏖️ Pulau & Pantai';
                if (cat === 'Heritage') label = '🕌 Seni & Warisan';
                if (cat === 'Family') label = '🎡 Keluarga & Hiburan';

                return (
                  <button
                    id={`cat-filter-chip-${cat}`}
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition shadow-sm cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-100/70'
                    }`}
                  >
                    {label} <span className={`text-[9px] px-1 rounded ml-1 font-mono ${isSelected ? 'bg-emerald-700/80 text-white' : 'bg-slate-100 text-slate-500'}`}>{spotCountInThisCategory}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Dynamic Layout Splitting Grid: 12 Cols */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT/MID PANEL: Active Selected Focus Area + Interactive Map + Cards Grid (8 Cols) */}
          <div className="space-y-6 lg:col-span-8 flex flex-col">
            
            {/* 1. MAP SECTION (Highly focal, Interactive) */}
            <div className="h-[460px] md:h-[500px]">
              <MapComponent
                spots={TOURIST_SPOTS}
                selectedSpot={selectedSpot}
                onSelectSpot={handleSelectSpot}
                selectedDistrict={selectedDistrict}
                onSelectDistrict={setSelectedDistrict}
              />
            </div>

            {/* FOCAL ZONE: Selected Spot Detail Box (Only show if a spot is active) */}
            <AnimatePresence mode="wait">
              {selectedSpot && (
                <motion.div
                  id="expanded-spot-focal-card"
                  key={selectedSpot.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-tr from-white to-emerald-50/20 border border-emerald-100 rounded-2xl p-5 shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row gap-5">
                    <img
                      src={selectedSpot.imageUrl}
                      alt={selectedSpot.name}
                      referrerPolicy="no-referrer"
                      className="w-full md:w-60 h-44 object-cover rounded-xl shadow-inner border border-emerald-100/50"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-1.5 leading-tight">
                            <span className="text-amber-500">📍</span>
                            {selectedSpot.name}
                          </h2>
                          <span className="text-[10px] font-bold font-mono tracking-wide px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                            Daerah: {selectedSpot.district}
                          </span>
                        </div>

                        <p className="text-xs text-emerald-900/80 leading-relaxed font-normal mb-4">
                          {selectedSpot.description}
                        </p>

                        {/* Complete official properties */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-[11px] font-medium text-slate-700">
                          <div>
                            <span className="text-emerald-800 font-bold block mb-0.5">Waktu Operasi:</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              {selectedSpot.openingHours}
                            </span>
                          </div>
                          <div>
                            <span className="text-emerald-800 font-bold block mb-0.5">Yuran Masuk Rasmi:</span>
                            <span className="text-slate-600 font-semibold">{selectedSpot.ticketPriceText}</span>
                          </div>
                        </div>
                      </div>

                      {/* Floating feature list bar & direction helpers */}
                      <div className="mt-4 pt-3.5 border-t border-emerald-50/80 flex flex-wrap gap-2 items-center justify-between">
                        <div className="flex gap-1">
                          {selectedSpot.features.map((feat, i) => (
                            <span key={i} className="text-[9px] bg-white border border-emerald-100 rounded px-1.5 py-0.5 text-emerald-800 font-semibold">
                              {feat}
                            </span>
                          ))}
                        </div>
                        
                        <a
                          id="spot-gmaps-direct"
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedSpot.coordinates.lat},${selectedSpot.coordinates.lng}`}
                          target="_blank"
                          rel="noopener"
                          className="text-white bg-emerald-600 hover:bg-emerald-700 font-semibold px-4 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Navigation className="w-3 h-3" />
                          Buka Google Maps
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attractions grid titles */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-emerald-600" />
                  Senarai Destinasi Pilihan ({filteredSpots.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik &quot;Detail&quot; untuk info penuh atau &quot;Fokus di Peta&quot; untuk meletakkan kedudukan GPS
                </p>
              </div>
            </div>

            {/* Tourist Spots Cards Grid */}
            {filteredSpots.length === 0 ? (
              <div id="no-spots-matches" className="text-center py-12 bg-white rounded-2xl border border-dashed border-emerald-100 p-8">
                <Compass className="w-12 h-12 text-emerald-300 mx-auto mb-3 animate-pulse" />
                <h4 className="font-semibold text-emerald-950">Gagal mencari sebarang padanan</h4>
                <p className="text-xs text-emerald-750 max-w-md mx-auto mt-1 leading-relaxed">
                  Tiada tarikan pelancongan ditemui untuk &quot;{searchQuery}&quot;. Cuba tukar kata kunci, tukar penapis daerah, atau set semula pilihan penapis kategori anda!
                </p>
                
                <button
                  id="reset-all-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDistrict('Semua');
                    setSelectedCategory('Semua');
                  }}
                  className="mt-4 bg-emerald-600 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                >
                  Set Semula Carian Anda
                </button>
              </div>
            ) : (
              <div id="tourist-spots-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSpots.map((spot) => (
                  <TouristSpotCard
                    key={spot.id}
                    spot={spot}
                    isSelected={selectedSpotId === spot.id}
                    onSelect={() => handleSelectSpot(spot)}
                    onSelectOnMap={() => handleFocusSpotOnMap(spot)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE PANEL: Ticket Calculator + AI Assistant Widget (4 Cols) */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* 1. CALCULATOR WIDGET */}
            <div className="sticky top-4">
              <TicketCalculator 
                spots={TOURIST_SPOTS} 
                selectedSpot={selectedSpot}
                onSelectSpot={handleSelectSpot}
              />
            </div>

            {/* 2. CHAT WITH AI ASSISTANT */}
            <div>
              <AiAssistant selectedSpot={selectedSpot} />
            </div>

            {/* Culinary Spot Trivia card */}
            <div id="kedah-culinary-spotlight" className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-200/50 p-4.5 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-700" />
                Info Makanan: Kulinari Kedah! 🍲
              </h4>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Di Kedah, anda wajib mencuba <strong>Laksa Kedah</strong> tulen yang kaya kuah ikan selayang pekat, ulam daun kesum, dan asid gelugur segar. Dapatkan pekasam laut segar dan Kuih Peneram rangup di tapak Pekan Rabu baharu di Alor Setar!
              </p>
            </div>
            
            {/* Tip of the day */}
            <div id="kedah-travel-tip" className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-semibold text-slate-800">Tips Ringkas Kembara</h5>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                  Cuaca paling bersesuaian mawat sawah menghijau bermula dari November ke Januari. Musim menuai padi padi berwarna emas bermula pertengahan Januari hingga Mac.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Informative Frequently Asked Questions Footer Block */}
        <div className="mt-16 bg-white border border-emerald-100/80 rounded-2xl p-6 shadow-sm">
          <button 
            id="toggle-faq-btn"
            onClick={() => setShowFaq(!showFaq)}
            className="w-full flex items-center justify-between text-left font-semibold text-emerald-950 text-sm cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-emerald-600" />
              Soalan Lazim Lawatan ke Negeri Kedah (FAQ)
            </span>
            <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">
              {showFaq ? 'Sembunyikan' : 'Papar Info'}
            </span>
          </button>

          <AnimatePresence>
            {showFaq && (
              <motion.div
                id="faq-content-pane"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-emerald-50 text-xs text-slate-600 space-y-4 leading-relaxed overflow-hidden"
              >
                <div>
                  <h5 className="font-bold text-emerald-950 mb-1">1. Bilakah waktu terbaik untuk melawat Kedah?</h5>
                  <p>
                    Waktu terbaik bergantung kepada perancangan anda. Jika anda ingin menikmati lanskap bentangan sawah padi segar menghijau berkilau, datanglah dari bulan Julai hingga September. Bagi tempoh menuai sawah padi emas merona pudar, hujung Januari hingga Mac ialah waktu keemasan.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-emerald-950 mb-1">2. Adakah kebanyakan muzium sejarah mengenakan bayaran?</h5>
                  <p>
                    Muzium Padi Kedah mengenakan yuran yang sangat berpatutan iaitu RM5 dewasa untuk mengekalkan keindahan mural gergasi. Tempat-tempat berserjarah keagamaan diraja lain seperti Masjid Zahir dan Muzium Arkeologi Lembah Bujang bertaraf dunia adalah percuma demi menyebarkan pengetahuan sejarah warisan negara.
                  </p>
                </div>
                <div>
                  <h5 className="font-bold text-emerald-950 mb-1">3. Bagaimanakah cara pengangkutan terbaik di daerah luar bandar?</h5>
                  <p>
                    Menyewa kereta atau menaiki kenderaan persendirian adalah cara paling optimum untuk daerah daratan seperti Baling, Yan dan Sik. Bagi pulau Langkawi, sewaan motosikal atau kereta sedia ada di pangkalan terminal feri feri jeti Kuah.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* footer credits */}
      <footer className="mt-20 border-t border-slate-200 text-center py-6 text-slate-400 text-[11px] font-medium max-w-7xl mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} Portal Pelancongan Kedah Darul Aman. Maklumat harga dan yuran tertakluk kepada perubahan semasa.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-400">Selamat Melawat Negeri Jelapang Padi yang Indah Mempesona.</p>
      </footer>
    </div>
  );
}

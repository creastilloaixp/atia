import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, Square, Map } from 'lucide-react';

export function LuxuryPropertyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="relative w-full max-w-[960px] mx-auto flex flex-col glow-accent rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-[#101c22] mt-8"
    >
      {/* Main Image Section */}
      <div 
        className="relative w-full aspect-video bg-cover bg-center group"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2560&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#101c22]/90 via-transparent to-transparent"></div>
        
        {/* Floating Badge */}
        <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full glass-panel text-xs font-bold tracking-widest uppercase text-tb-accent border border-tb-accent/30 shadow-lg">
            Exclusive Listing
        </div>

        {/* Price Overlay - Glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 glass-panel border-t border-white/10 m-4 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-tb-accent text-sm font-bold tracking-[0.2em] uppercase">Private Residence</p>
              <h1 className="font-serif text-white text-4xl md:text-5xl lg:text-6xl leading-tight font-light">$1,250,000</h1>
              <div className="flex items-center gap-2 text-slate-300 mt-2">
                <MapPin className="text-tb-accent" size={20} />
                <p className="text-lg md:text-xl font-light tracking-wide">Beverly Hills, CA</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button className="flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-8 bg-tb-accent text-[#050505] text-base font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(56,189,248,0.3)]">
                Agendar Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-[#101c22] p-6 md:p-8 border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-6 transition-colors hover:border-tb-accent/30 group">
            <div className="text-tb-accent bg-tb-accent/10 p-3 rounded-lg group-hover:bg-tb-accent group-hover:text-[#050505] transition-all">
              <BedDouble size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white text-lg font-bold">4 Camas</h3>
              <p className="text-white/50 text-sm">Suites Principales</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-6 transition-colors hover:border-tb-accent/30 group">
            <div className="text-tb-accent bg-tb-accent/10 p-3 rounded-lg group-hover:bg-tb-accent group-hover:text-[#050505] transition-all">
              <Bath size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white text-lg font-bold">5 Baños</h3>
              <p className="text-white/50 text-sm">Diseño de Spa</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-6 transition-colors hover:border-tb-accent/30 group">
            <div className="text-tb-accent bg-tb-accent/10 p-3 rounded-lg group-hover:bg-tb-accent group-hover:text-[#050505] transition-all">
              <Square size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-white text-lg font-bold">4,200 Sqft</h3>
              <p className="text-white/50 text-sm">Residencia Extensa</p>
            </div>
          </div>
        </div>

        {/* Map/Location Preview */}
        <div className="mt-8 rounded-xl overflow-hidden border border-white/5 relative h-48 group cursor-pointer">
          <div className="absolute inset-0 bg-[#050505]/60 z-10 pointer-events-none transition-opacity group-hover:opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 border border-white/20 transition-transform group-hover:scale-105">
              <Map className="text-tb-accent" size={20} />
              <span className="text-white text-sm font-medium tracking-wide">Vista Aérea Automática</span>
            </div>
          </div>
          <div 
            className="w-full h-full bg-cover bg-center grayscale contrast-125 brightness-50 transition-transform duration-1000 group-hover:scale-110" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2560&auto=format&fit=crop")' }}
          ></div>
        </div>
      </div>
    </motion.div>
  );
}

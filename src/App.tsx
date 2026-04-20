import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { initAutoTracking, trackCTAClick, trackPhoneClick } from './lib/analytics';
import { SellerDiagnostic } from './components/SellerDiagnostic';
import { TrustBar } from './components/TrustBar';
import { SellerHero } from './components/SellerHero';
import { SellerProcess } from './components/SellerProcess';
import { DebtTypes } from './components/DebtTypes';
import { SellerTestimonials } from './components/SellerTestimonials';
import { SellerFAQ } from './components/SellerFAQ';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { AnimatedDock } from './components/AnimatedDock';
import { DebtCalculator } from './components/DebtCalculator';
import { Footer } from './components/Footer';
import { SmartLeadForm } from './components/SmartLeadForm';
import { VisionDashboard } from './components/VisionDashboard';
import { AtiaLogo } from './components/AtiaLogo';
import { ZadarmaCallWidget } from './components/ZadarmaCallWidget';
import { FlippingCalculator } from './components/FlippingCalculator';
import { ToastContainer, toast } from './components/Toast';

type Audience = 'seller' | 'admin';

function App() {
  const [audience, setAudience] = useState<Audience>('seller');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const campaign = params.get('campaign') || 'general';

  useEffect(() => {
    if (window.location.hash === '#admin') {
      setAudience('admin');
    }
    const handleAdmin = () => setAudience('admin');
    window.addEventListener('open-admin', handleAdmin);
    const cleanupTracking = initAutoTracking();
    return () => {
      window.removeEventListener('open-admin', handleAdmin);
      cleanupTracking();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [audience]);

  const openForm = () => {
    trackCTAClick('open_form');
    setIsFormOpen(true);
  };

  const callAdvisor = async (phone?: string) => {
    if (isCalling) return;
    if (!phone) {
      toast('Por favor ingresa tu numero de telefono.', 'warning');
      return;
    }
    setIsCalling(true);
    
    // Telemetry Broadcast for Live Presentation
    const bc = new BroadcastChannel('zadarma_telemetry');
    bc.postMessage({ type: 'CALL_INITIATED', phone, timestamp: new Date().toISOString() });
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/zadarma-callback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ phone }),
        }
      );
      const data = await response.json();

      if (data.status === 'success') {
        bc.postMessage({ type: 'CALL_SUCCESS', data });
        toast('Un asesor te llamara en los proximos segundos!', 'success');
      } else {
        bc.postMessage({ type: 'CALL_ERROR', message: data.message });
        toast(`No se pudo conectar la llamada (${data.message || 'Error desconocido'}). Llamanos: (667) 454-0164`, 'error');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast('No pudimos iniciar el puente automático. Por favor, intenta de nuevo o usa el botón de WhatsApp.', 'error');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <div className="bg-mesh-gradient min-h-screen font-sans antialiased text-slate-900 selection:bg-tb-accent/30 overflow-x-hidden relative flex flex-col">
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-pattern opacity-100"></div>
      <div className="pointer-events-none fixed inset-0 z-50 shadow-[inset_0_0_200px_rgba(56,189,248,0.03)]"></div>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[800px] h-[800px] bg-tb-accent/[0.08] blur-[140px] rounded-full animate-float"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[700px] h-[700px] bg-amber-500/[0.06] blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[500px] h-[500px] bg-indigo-500/[0.04] blur-[100px] rounded-full animate-float" style={{ animationDelay: '-5s' }}></div>
        
        {/* Atia Background Watermark Symbols */}
        <div className="absolute top-[15%] right-[-5%] opacity-[0.08] rotate-[15deg] pointer-events-none select-none blur-[2px]">
          <svg width="600" height="600" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 160L100 80L140 160" stroke="#FF6600" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 65C100 65 90 50 82 55C74 60 76 75 100 90C124 75 126 60 118 55C110 50 100 65 100 65Z" fill="#FF6600"/>
          </svg>
        </div>
        
        <div className="absolute top-[60%] left-[-10%] opacity-[0.06] rotate-[-25deg] pointer-events-none select-none blur-[1px]">
          <svg width="800" height="800" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 160L100 80L140 160" stroke="#FF6600" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M100 65C100 65 90 50 82 55C74 60 76 75 100 90C124 75 126 60 118 55C110 50 100 65 100 65Z" fill="#FF6600"/>
          </svg>
        </div>
      </div>

    <nav className="fixed top-0 w-full p-3 md:p-4 flex justify-between items-center z-40 bg-white/30 backdrop-blur-md border-b border-white/20" role="navigation" aria-label="Navegación principal">
        <div className="flex items-center gap-2">
          <AtiaLogo height={72} primaryColor="#FF6600" />
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <Calculator size={14} className="md:w-3.5 md:h-3.5" />
            <span>Sana tu Deuda</span>
          </button>
          <a
            href="tel:+526674540164"
            onClick={() => trackPhoneClick()}
            className="hidden md:flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs font-bold tracking-wide"
            aria-label="Llamar al asesor: (667) 454-0164"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            (667) 454-0164
          </a>
          <span className="text-emerald-700 flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase" aria-label="Estado del servicio: Operando">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="hidden md:inline">Operando</span>
          </span>
          <a
            href="https://atiaadministra.vercel.app/admin/login"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-200 px-3 md:px-4 py-2 rounded-full bg-white/70 text-slate-600 hidden sm:flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase font-bold shadow-sm hover:bg-[#FF6600] hover:text-white hover:border-[#FF6600] transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]"></span>
            ATIA ANALYTICS
          </a>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col min-h-screen">
        {audience === 'seller' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <ZadarmaCallWidget onCallAdvisor={callAdvisor} isCalling={isCalling} />
            <div className="pt-24">
              <SellerDiagnostic 
                onOpenForm={openForm} 
                onOpenCalculator={() => setIsCalculatorOpen(true)} 
                campaign={campaign}
              />
            </div>
            <TrustBar />
            <SellerHero onOpenForm={openForm} onOpenCalculator={() => setIsCalculatorOpen(true)} />
            <FlippingCalculator />
            <DebtTypes onOpenForm={openForm} onOpenCalculator={() => setIsCalculatorOpen(true)} />
            <SellerProcess />
            <SellerTestimonials />
            <SellerFAQ />
            <Footer onOpenForm={openForm} />
          </motion.div>
        )}

        {audience === 'admin' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <VisionDashboard onBack={() => setAudience('seller')} />
          </motion.div>
        )}
      </main>

      <div className="hidden md:block">
        <AnimatedDock audience={audience} />
      </div>
      <WhatsAppFloat />
      <DebtCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
      <SmartLeadForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        campaign={campaign}
      />
      <ToastContainer />
    </div>
  );
}

export default App;
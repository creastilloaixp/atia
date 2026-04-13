import { motion } from 'framer-motion';
import { AnimatedText } from './AnimatedText';
import { MagneticButton } from './MagneticButton';
import { PhoneCall } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center min-h-screen bg-zinc-950 py-32 px-4 sm:px-6 lg:px-8">
      {/* Background decorations - Subtle grid/glow for premium feel */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0,rgba(0,0,0,0)_50%)]" />
        <div className="absolute w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        {/* Animated Headline: Spring physics words floating up (The Relief) */}
        <AnimatedText text="Compramos tu casa hoy mismo" />
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          className="mt-6 text-xl md:text-2xl text-zinc-400 font-light tracking-wide max-w-2xl text-center"
        >
          Liquidación rápida. Sin comisiones ocultas. Eliminamos tu estrés inmobiliario y financiero en un solo movimiento.
        </motion.p>
        
        {/* Floating Call to Action Container */}
        <motion.div
           animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mt-16 sm:mt-24 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)]"
        >
          <div className="px-6 flex items-center space-x-3 text-zinc-300 font-medium">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span>+52 55 1234 5678</span>
          </div>
          
          <MagneticButton className="ml-2 !bg-blue-600 hover:!bg-blue-500 !text-white flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all">
            Llámenme
            <PhoneCall className="w-5 h-5 ml-1" />
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
};

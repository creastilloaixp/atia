import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Phone, Calendar, Clock } from 'lucide-react';
import { submitLead } from '../lib/leads';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaign?: string;
}

type Step = 'intent' | 'value' | 'contact' | 'schedule' | 'success';

// Generate available time slots
const generateTimeSlots = () => {
  const slots = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  for (let h = startHour; h <= endHour; h++) {
    const hour = h <= 12 ? h : h - 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    slots.push({ id: `${h}:00`, label: `${hour}:00 ${ampm}` });
    if (h < endHour) {
      slots.push({ id: `${h}:30`, label: `${hour}:30 ${ampm}` });
    }
  }
  return slots;
};

// Generate next 7 days
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) { // Skip Sundays
      dates.push({
        id: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
      });
    }
  }
  return dates;
};

export function SmartLeadForm({ isOpen, onClose, campaign }: Props) {
  const [step, setStep] = useState<Step>('intent');
  const [formData, setFormData] = useState({
    intent: '',
    valueRange: '',
    name: '',
    phone: '',
    preferredDate: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleNext = (nextStep: Step, key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setStep(nextStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const city = urlParams.get('city') || urlParams.get('utm_source') || 'General';

    const result = await submitLead({
      name: formData.name,
      phone: formData.phone,
      city: city,
      metadata: {
        intent: formData.intent,
        property_value: formData.valueRange,
        campaign: campaign || "general",
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        appointment_scheduled: !!(formData.preferredDate && formData.preferredTime)
      }
    });

    if (result.success) {
      setStep('schedule'); // Ir al paso de agendar cita
    } else {
      setStep('schedule');
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setStep('intent');
    setFormData({ intent: '', valueRange: '', name: '', phone: '', preferredDate: '', preferredTime: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-tb-dark/95 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-tb-accent animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  {step === 'success' ? (formData.preferredDate ? 'Cita Agendada' : 'Análisis Completado') : 'Perfilamiento IA'}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 min-h-[320px] relative">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Intención */}
                {step === 'intent' && (
                  <motion.div 
                    key="step-intent"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-light text-white mb-2">¿Cuál es tu objetivo principal?</h3>
                      <p className="text-sm text-slate-400 font-light">Esto nos ayuda a asignar el analista adecuado.</p>
                    </div>

                    <div className="grid gap-3">
                      {[
                        { id: 'remodelacion', label: 'Tengo una propiedad para remodelar', icon: '🏗️' },
                        { id: 'deuda', label: 'Vender rápido (Liquidación/Deuda)', icon: '⚡' },
                        { id: 'terreno', label: 'Tengo un terreno para desarrollo', icon: '🗺️' },
                        { id: 'inversion', label: 'Quiero invertir capital en un Flip', icon: '💰' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleNext('value', 'intent', option.id)}
                          className="w-full text-left p-4 rounded-2xl border border-white/10 hover:border-tb-accent/50 bg-white/5 hover:bg-tb-accent/10 transition-all flex items-center gap-4 group"
                        >
                          <span className="text-xl">{option.icon}</span>
                          <span className="text-slate-300 font-medium group-hover:text-white">{option.label}</span>
                          <ArrowRight size={16} className="ml-auto text-slate-500 group-hover:text-tb-accent transition-colors" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Rango de Valor */}
                {step === 'value' && (
                  <motion.div 
                    key="step-value"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <button onClick={() => setStep('intent')} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs uppercase tracking-wider font-bold mb-4 transition-colors">
                        <ArrowLeft size={14} /> Atrás
                      </button>
                      <h3 className="text-2xl font-light text-white mb-2">Valor estimado actual</h3>
                      <p className="text-sm text-slate-400 font-light">Ayuda a nuestro algoritmo a buscar comparables.</p>
                    </div>

                    <div className="grid gap-3">
                      {[
                        { id: 'menos-1m', label: 'Menos de $1M MXN' },
                        { id: '1m-3m', label: '$1M a $3M MXN' },
                        { id: '3m-7m', label: '$3M a $7M MXN' },
                        { id: 'mas-7m', label: 'Más de $7M MXN' }
                      ].map(option => (
                        <button
                          key={option.id}
                          onClick={() => handleNext('contact', 'valueRange', option.id)}
                          className="w-full text-center p-4 rounded-xl border border-white/10 hover:border-tb-accent/50 bg-white/5 hover:bg-tb-accent/10 transition-all text-slate-300 font-medium hover:text-white text-lg"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Contacto (Zadarma Trigger) */}
                {step === 'contact' && (
                  <motion.div 
                    key="step-contact"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <button onClick={() => setStep('value')} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs uppercase tracking-wider font-bold mb-4 transition-colors">
                        <ArrowLeft size={14} /> Atrás
                      </button>
                      <h3 className="text-2xl font-light text-white mb-2">Desbloquea tu análisis</h3>
                      <p className="text-sm text-tb-accent font-medium">Un asesor Senior te enlazará al instante para validar tus datos.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Nombre Completo</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-tb-accent focus:bg-white/10 transition-all shadow-sm"
                          placeholder="Ej. Roberto Sánchez"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-2">
                          Teléfono (Móvil) <span className="text-tb-accent text-[10px] font-bold">*Requerido para el enlace</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+52</span>
                          <input
                            required
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-tb-accent focus:bg-white/10 transition-all shadow-sm"
                            placeholder="55 1234 5678"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !formData.name || !formData.phone}
                        className="w-full h-12 mt-4 rounded-xl bg-white text-tb-dark font-bold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 relative overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-tb-dark/20 border-t-tb-dark rounded-full animate-spin" />
                        ) : (
                          <>
                            <Phone size={18} className="group-hover:animate-pulse" />
                            <span>Continuar para Agendar</span>
                          </>
                        )}
                      </button>
                      <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold pt-2">
                        🔒 Datos protegidos por encriptación AES-256
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* STEP 4: Agendar Cita */}
                {step === 'schedule' && (
                  <motion.div 
                    key="step-schedule"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <button onClick={() => setStep('contact')} className="text-slate-400 hover:text-white flex items-center gap-1 text-xs uppercase tracking-wider font-bold mb-4 transition-colors">
                        <ArrowLeft size={14} /> Atrás
                      </button>
                      <h3 className="text-2xl font-light text-white mb-2">¿Cuándo puedes recibir la visita?</h3>
                      <p className="text-sm text-slate-400 font-light">Agenda con un asesor experto sin costo.</p>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                        <Calendar size={12} /> Selecciona fecha
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableDates.map(date => (
                          <button
                            key={date.id}
                            onClick={() => setFormData(prev => ({ ...prev, preferredDate: date.id }))}
                            className={`p-3 rounded-xl text-center transition-all ${
                              formData.preferredDate === date.id
                                ? 'bg-tb-accent text-white font-bold border-2 border-tb-accent shadow-md shadow-tb-accent/20'
                                : 'bg-white/5 border border-white/10 text-slate-300 hover:border-tb-accent/50'
                            }`}
                          >
                            <div className="text-xs uppercase opacity-80">{date.label.split(' ')[0]}</div>
                            <div className="text-lg font-bold">{date.label.split(' ')[1]}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.preferredDate && (
                      <div>
                        <label className="block text-xs uppercase font-bold text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                          <Clock size={12} /> Selecciona hora
                        </label>
                        <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                          {timeSlots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => setFormData(prev => ({ ...prev, preferredTime: slot.id }))}
                              className={`p-2 rounded-lg text-xs transition-all ${
                                formData.preferredTime === slot.id
                                  ? 'bg-tb-accent text-white font-bold border-2 border-tb-accent shadow-sm'
                                  : 'bg-white/5 border border-white/10 text-slate-300 hover:border-tb-accent/50'
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('success')}
                        className="flex-1 h-12 rounded-xl border border-white/10 text-slate-400 font-medium hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        Omitir
                      </button>
                      <button
                        onClick={() => setStep('success')}
                        disabled={!formData.preferredDate || !formData.preferredTime}
                        className="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:shadow-none"
                      >
                        <Calendar size={16} />
                        Confirmar Cita
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 5: Success */}
                {step === 'success' && (
                  <motion.div 
                    key="step-success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center space-y-4 py-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
                      <CheckCircle2 size={40} className="text-emerald-400" />
                    </div>
                    
                    {formData.preferredDate ? (
                      <>
                        <h3 className="text-2xl font-light text-white">¡Cita Agendada!</h3>
                        <p className="text-sm text-slate-300 font-light leading-relaxed max-w-[260px]">
                          Tu cita está confirmada para el{' '}
                          <span className="text-tb-accent font-medium">
                            {new Date(formData.preferredDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>{' '}
                          a las{' '}
                          <span className="text-tb-accent font-medium">
                            {formData.preferredTime.split(':')[0]}:{formData.preferredTime.split(':')[1]} hrs
                          </span>
                        </p>
                        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-full">
                          <p className="text-xs text-emerald-400 font-medium tracking-wide">Recibirás recordatorio por WhatsApp</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-2xl font-light text-white">Análisis en proceso</h3>
                        <p className="text-sm text-slate-300 font-light leading-relaxed max-w-[260px]">
                          Hemos recibido tu información. En unos momentos recibirás una llamada de nuestro equipo y confirmación por WhatsApp.
                        </p>
                        <div className="mt-4 p-4 rounded-xl bg-tb-accent/10 border border-tb-accent/20 w-full">
                          <p className="text-xs text-tb-accent font-medium tracking-wide">¿Quieres agendar una visita? Llámanos al (667) 454-0164</p>
                        </div>
                      </>
                    )}
                    
                    <button
                      onClick={resetForm}
                      className="mt-6 px-8 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
                    >
                      Volver al inicio
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { Brain, ShieldCheck, Zap, AlertTriangle, RefreshCw, Globe } from 'lucide-react';

const translations: Record<string, any> = {
  RU: {
    title: "Психологический Аудит",
    stable: { t: "СТАБИЛЬНОСТЬ", a: "Ваши когнитивные функции в норме. Действуйте по алгоритму.", r: "Допуск разрешен" },
    fomo: { t: "АЗАРТ / FOMO", a: "Вы под влиянием эмоций. Рекомендуется пауза 60 минут.", r: "Снизить лот на 50%" },
    tilt: { t: "ТИЛЬТ", a: "Эмоциональная дестабилизация. Немедленно закройте терминал.", r: "Блокировка торгов 24ч" },
    reset: "Сброс системы", status: ["Спокоен", "Азарт", "Тильт"]
  },
  TJ: {
    title: "Аудити Психологӣ",
    stable: { t: "УСТУВОРӢ", a: "Ҳолати рӯҳии шумо мӯътадил аст. Мувофиқи алгоритм амал кунед.", r: "Иҷозат дода шуд" },
    fomo: { t: "ҲАРИСӢ / FOMO", a: "Шумо зери эҳсосот ҳастед. Тавсия дода мешавад: 60 дақиқа таваққуф.", r: "Ҳаҷми лотро 50% кам кунед" },
    tilt: { t: "ТИЛТ (ҒАЗАБ)", a: "Ноустувории эҳсосотӣ. Ҳозир терминалро пӯшед.", r: "Манъи савдо барои 24 соат" },
    reset: "Танзими дубора", status: ["Ором", "Ҳарисӣ", "Тилт"]
  },
  EN: {
    title: "Psychological Audit",
    stable: { t: "STABILITY", a: "Your cognitive functions are normal. Follow the SMC algorithm.", r: "Access granted" },
    fomo: { t: "GREED / FOMO", a: "Emotional influence detected. 60-minute break recommended.", r: "Reduce lot size by 50%" },
    tilt: { t: "CRITICAL TILT", a: "Emotional instability. Close the terminal immediately.", r: "24h Trading Ban" },
    reset: "Reset System", status: ["Calm", "Greed", "Tilt"]
  }
};

const PsychologyAudit = () => {
  const [lang, setLang] = useState('RU');
  const [status, setStatus] = useState<string | null>(null);
  const t = translations[lang];

  const getAnalysis = (type: string) => {
    const data = t[type];
    const colors: Record<string, string> = { stable: "text-green-500 border-green-500/20 bg-green-500/5", fomo: "text-yellow-500 border-yellow-500/20 bg-yellow-500/5", tilt: "text-red-500 border-red-500/20 bg-red-500/5" };
    return { ...data, style: colors[type] };
  };

  const report = status ? getAnalysis(status) : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="bg-[#0A0A0A]/60 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl">
        
        {/* Language Switcher */}
        <div className="flex justify-end gap-2 mb-8">
          {['RU', 'TJ', 'EN'].map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-md text-[10px] border ${lang === l ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-white/5 text-gray-500'}`}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center mb-10">
          <Brain className="w-8 h-8 text-[#D4AF37] mb-4" />
          <h2 className="text-xl font-light tracking-[0.3em] text-white uppercase text-center">{t.title}</h2>
        </div>

        {!status ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['stable', 'fomo', 'tilt'].map((id, index) => (
              <button key={id} onClick={() => setStatus(id)} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-center group">
                <div className="text-[11px] uppercase tracking-widest text-gray-400 group-hover:text-white font-bold">{t.status[index]}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className={`rounded-3xl border p-8 text-center animate-in zoom-in duration-500 ${report?.style}`}>
            <h3 className="text-xl font-bold mb-4">{report?.t}</h3>
            <p className="text-gray-300 italic mb-8 font-light italic">"{report?.a}"</p>
            <div className="text-[10px] uppercase tracking-widest opacity-70 mb-8">Рекомендация: {report?.r}</div>
            <button onClick={() => setStatus(null)} className="flex items-center gap-2 mx-auto text-[10px] uppercase tracking-widest text-gray-500 hover:text-[#D4AF37]">
              <RefreshCw size={12} /> {t.reset}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PsychologyAudit;

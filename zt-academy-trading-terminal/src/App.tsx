import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Send, TrendingUp, TrendingDown, Zap, Shield, BookOpen, ChevronRight, Activity, BarChart2, DollarSign, AlertTriangle, RefreshCw } from "lucide-react";
import videoPlaceholder from './assets/video_placeholder.jpg';
// Custom Instagram SVG icon (lucide-react may not export it in all versions)
function InstagramIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface GoldPrice {
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  timestamp: number;
}

interface VideoLesson {
  id: number;
  titleTajik: string;
  titleEn: string;
  youtubeId: string;
  tag: string;
  icon: React.ReactNode;
  duration: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GOLD_COLOR = "#D4AF37";
const GOLD_GLOW = "rgba(212,175,55,0.6)";
const GOLD_SOFT = "rgba(212,175,55,0.15)";

const VIDEO_LESSONS: VideoLesson[] = [
  {
    id: 1,
    titleTajik: "Асосҳои SMC ва Algorithm",
    titleEn: "SMC & Algorithm Fundamentals",
    youtubeId: "dQw4w9WgXcQ",
    tag: "BEGINNER",
    icon: <BookOpen size={18} />,
    duration: "45 min",
  },
  {
    id: 2,
    titleTajik: "Order Flow ва Liquidity",
    titleEn: "Order Flow & Liquidity",
    youtubeId: "dQw4w9WgXcQ",
    tag: "INTERMEDIATE",
    icon: <Activity size={18} />,
    duration: "62 min",
  },
  {
    id: 3,
    titleTajik: "Стратегияи ворид шудан",
    titleEn: "Entry Strategy Mastery",
    youtubeId: "dQw4w9WgXcQ",
    tag: "ADVANCED",
    icon: <BarChart2 size={18} />,
    duration: "78 min",
  },
  {
    id: 4,
    titleTajik: "Психология ва Risk Management",
    titleEn: "Psychology & Risk Management",
    youtubeId: "dQw4w9WgXcQ",
    tag: "MASTER",
    icon: <Shield size={18} />,
    duration: "55 min",
  },
];

const TAG_COLORS: Record<string, string> = {
  BEGINNER: "#22d3ee",
  INTERMEDIATE: "#a78bfa",
  ADVANCED: "#f97316",
  MASTER: "#D4AF37",
};

// ─── MINI SPARKLINE ───────────────────────────────────────────────────────────
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 80, h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <svg width={w} height={h} className="opacity-80">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ─── SCAN LINE OVERLAY ────────────────────────────────────────────────────────
function ScanLines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
      }}
    />
  );
}

// ─── CORNER DECORATION ───────────────────────────────────────────────────────
function CornerDeco({ className }: { className?: string }) {
  return (
    <div className={`absolute w-6 h-6 pointer-events-none ${className}`}>
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M0 24 L0 0 L24 0" stroke={GOLD_COLOR} strokeWidth="1.5" opacity="0.7" />
      </svg>
    </div>
  );
}

// ─── GLASS CARD ───────────────────────────────────────────────────────────────
function GlassCard({
  children,
  className = "",
  glow = false,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={`relative rounded-2xl border ${className}`}
      style={{
        background: "rgba(5, 5, 15, 0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderColor: glow ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.18)",
        boxShadow: glow
          ? `0 0 32px ${GOLD_GLOW}, inset 0 1px 0 rgba(212,175,55,0.15)`
          : "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        ...style,
      }}
      whileHover={glow ? { boxShadow: `0 0 60px ${GOLD_GLOW}, inset 0 1px 0 rgba(212,175,55,0.2)` } : {}}
    >
      <CornerDeco className="top-0 left-0" />
      <CornerDeco className="top-0 right-0 rotate-90" />
      <CornerDeco className="bottom-0 left-0 -rotate-90" />
      <CornerDeco className="bottom-0 right-0 rotate-180" />
      {children}
    </motion.div>
  );
}

// ─── LIVE INDICATOR ───────────────────────────────────────────────────────────
function LiveIndicator() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ backgroundColor: "#22c55e" }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: "#22c55e" }}
        />
      </span>
      <span className="text-xs font-bold tracking-widest" style={{ color: "#22c55e" }}>
        LIVE
      </span>
    </span>
  );
}

// ─── GOLD PRICE TICKER ────────────────────────────────────────────────────────
function GoldTicker() {
  const [gold, setGold] = useState<GoldPrice | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const controls = useAnimation();

  const fetchGold = useCallback(async () => {
    try {
      // Primary: Swissquote public feed (no API key)
      const res = await fetch(
        "https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD",
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error("Swissquote fail");
      const data = await res.json();
      // data is array: [{spreadProfilePrices:[{bid,ask}], ...}]
      const bid = parseFloat(data[0]?.spreadProfilePrices?.[0]?.bid ?? "0");
      const ask = parseFloat(data[0]?.spreadProfilePrices?.[0]?.ask ?? "0");
      const price = (bid + ask) / 2;
      if (!price || price < 100) throw new Error("bad price");

      setGold((prev) => {
        const prevPrice = prev?.price ?? price;
        const change = price - prevPrice;
        const changePct = (change / prevPrice) * 100;
        return {
          price,
          change: prev ? price - (prev.price - prev.change + change) : 0,
          changePct: prev ? changePct : 0,
          high: Math.max(prev?.high ?? price, price),
          low: Math.min(prev?.low ?? price, price),
          timestamp: Date.now(),
        };
      });
      setHistory((h) => [...h.slice(-29), price]);
      setLastUpdated(new Date());
      setError(false);
      setLoading(false);
      controls.start({ scale: [1, 1.02, 1], transition: { duration: 0.3 } });
    } catch {
      // Fallback: simulate realistic XAUUSD near 3320
      setGold((prev) => {
        const base = prev?.price ?? 3320 + Math.random() * 15;
        const drift = (Math.random() - 0.495) * 2.5;
        const price = parseFloat((base + drift).toFixed(2));
        return {
          price,
          change: parseFloat(drift.toFixed(2)),
          changePct: parseFloat(((drift / base) * 100).toFixed(3)),
          high: Math.max(prev?.high ?? price, price),
          low: Math.min(prev?.low ?? price, price),
          timestamp: Date.now(),
        };
      });
      setHistory((h) => {
        const last = h[h.length - 1] ?? 3320;
        return [...h.slice(-29), parseFloat((last + (Math.random() - 0.495) * 2.5).toFixed(2))];
      });
      setLastUpdated(new Date());
      setLoading(false);
      setError(true);
    }
  }, [controls]);

  useEffect(() => {
    fetchGold();
    const id = setInterval(fetchGold, 8000);
    return () => clearInterval(id);
  }, [fetchGold]);

  const positive = (gold?.change ?? 0) >= 0;

  return (
    <GlassCard glow className="p-5 md:p-7">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span
              className="text-xs font-bold tracking-[0.25em] px-2 py-0.5 rounded"
              style={{ background: GOLD_SOFT, color: GOLD_COLOR, border: `1px solid rgba(212,175,55,0.3)` }}
            >
              XAU / USD
            </span>
            <LiveIndicator />
          </div>
          <p className="text-xs text-zinc-400 tracking-wide">
            Spot Gold · Troy Ounce
          </p>
        </div>
        <button
          onClick={fetchGold}
          className="p-2 rounded-lg transition-all hover:scale-110"
          style={{ background: GOLD_SOFT, color: GOLD_COLOR }}
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Price Display */}
      {loading && !gold ? (
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
          <span className="text-zinc-400 text-sm">Fetching live price…</span>
        </div>
      ) : (
        <motion.div animate={controls}>
          <div className="flex items-end gap-4 mb-3">
            <div>
              <motion.p
                key={gold?.price}
                initial={{ opacity: 0.5, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono font-black leading-none"
                style={{
                  fontSize: "clamp(2rem, 7vw, 3.5rem)",
                  color: GOLD_COLOR,
                  textShadow: `0 0 30px ${GOLD_GLOW}`,
                  letterSpacing: "-0.02em",
                }}
              >
                ${gold?.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
            </div>
            <div className="pb-1 flex flex-col items-end gap-1">
              <Sparkline data={history.length > 2 ? history : [3315, 3318, 3320, 3317, 3322]} positive={positive} />
              <motion.div
                key={gold?.change}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold"
                style={{
                  background: positive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  color: positive ? "#22c55e" : "#ef4444",
                  border: `1px solid ${positive ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                }}
              >
                {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {positive ? "+" : ""}{gold?.change?.toFixed(2)} ({positive ? "+" : ""}{gold?.changePct?.toFixed(3)}%)
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
        {[
          { label: "SESSION HIGH", value: gold?.high?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: "▲", color: "#22c55e" },
          { label: "SESSION LOW", value: gold?.low?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: "▼", color: "#ef4444" },
          { label: "UPDATED", value: lastUpdated ? lastUpdated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "—", icon: "⏱", color: GOLD_COLOR },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-[9px] tracking-widest text-zinc-500 mb-1">{s.label}</p>
            <p className="font-mono text-xs font-bold" style={{ color: s.color }}>
              {s.icon} {s.value ?? "—"}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-400/70">
          <AlertTriangle size={11} />
          Simulated feed — live API temporarily unavailable
        </div>
      )}
    </GlassCard>
  );
}

// ─── RISK CALCULATOR ─────────────────────────────────────────────────────────
function RiskCalculator() {
  const [balance, setBalance] = useState("");
  const [risk, setRisk] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [riskAmount, setRiskAmount] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const b = parseFloat(balance);
    const r = parseFloat(risk);
    const sl = parseFloat(stopLoss);
    if (b > 0 && r > 0 && sl > 0 && r <= 100) {
      // Gold formula: Lot = (Balance * Risk%) / (SL pips * 10)
      const rAmt = b * (r / 100);
      const lot = rAmt / (sl * 10);
      setRiskAmount(parseFloat(rAmt.toFixed(2)));
      setResult(parseFloat(lot.toFixed(2)));
      setAnimKey((k) => k + 1);
    } else {
      setResult(null);
      setRiskAmount(null);
    }
  }, [balance, risk, stopLoss]);

  const riskColor =
    result === null
      ? GOLD_COLOR
      : parseFloat(risk) > 5
      ? "#ef4444"
      : parseFloat(risk) > 2
      ? "#f97316"
      : "#22c55e";

  const inputClass =
    "w-full bg-black/30 border rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:ring-2 transition-all";

  const inputStyle = (focused?: boolean) => ({
    borderColor: focused ? GOLD_COLOR : "rgba(212,175,55,0.2)",
    boxShadow: focused ? `0 0 20px rgba(212,175,55,0.2)` : "none",
  });

  return (
    <GlassCard className="p-5 md:p-7">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="font-bold text-base tracking-wider uppercase"
            style={{ color: GOLD_COLOR }}
          >
            ⚡ Risk Calculator
          </h3>
          <p className="text-[10px] text-zinc-500 tracking-widest mt-0.5">
            GOLD (XAU/USD) · SMC FORMULA
          </p>
        </div>
        <div
          className="text-[10px] px-2 py-1 rounded-lg font-mono"
          style={{ background: GOLD_SOFT, color: GOLD_COLOR, border: `1px solid rgba(212,175,55,0.25)` }}
        >
          GOLD ENGINE v2.0
        </div>
      </div>

      {/* Formula display */}
      <div
        className="rounded-xl p-3 mb-5 font-mono text-[10px] text-center tracking-wider"
        style={{ background: "rgba(212,175,55,0.05)", border: `1px dashed rgba(212,175,55,0.2)`, color: "rgba(212,175,55,0.7)" }}
      >
        LOT = (Balance × Risk%) ÷ (Stop Loss Pips × 10)
      </div>

      {/* Inputs */}
      <div className="space-y-4 mb-6">
        <div className="relative group">
          <label className="block text-[10px] tracking-widest text-zinc-400 mb-2 uppercase">
            <DollarSign size={9} className="inline mr-1" />Account Balance (USD)
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 10000"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className={inputClass}
            style={inputStyle()}
            onFocus={(e) => Object.assign(e.target.style, inputStyle(true))}
            onBlur={(e) => Object.assign(e.target.style, inputStyle(false))}
          />
        </div>
        <div className="relative group">
          <label className="block text-[10px] tracking-widest text-zinc-400 mb-2 uppercase">
            <Zap size={9} className="inline mr-1" />Risk Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 1"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className={inputClass}
            style={inputStyle()}
            onFocus={(e) => Object.assign(e.target.style, inputStyle(true))}
            onBlur={(e) => Object.assign(e.target.style, inputStyle(false))}
          />
          {risk && parseFloat(risk) > 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-red-400 mt-1 flex items-center gap-1"
            >
              <AlertTriangle size={9} /> High risk! SMC pros use 1–2%
            </motion.p>
          )}
        </div>
        <div className="relative group">
          <label className="block text-[10px] tracking-widest text-zinc-400 mb-2 uppercase">
            <BarChart2 size={9} className="inline mr-1" />Stop Loss (Pips)
          </label>
          <input
            type="number"
            min="0"
            placeholder="e.g. 20"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className={inputClass}
            style={inputStyle()}
            onFocus={(e) => Object.assign(e.target.style, inputStyle(true))}
            onBlur={(e) => Object.assign(e.target.style, inputStyle(false))}
          />
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result !== null ? (
          <motion.div
            key={animKey}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="rounded-2xl p-5 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(5,5,15,0.95) 0%, rgba(212,175,55,0.08) 100%)`,
              border: `1px solid ${riskColor}55`,
              boxShadow: `0 0 40px ${riskColor}33`,
            }}
          >
            {/* Glow orb */}
            <div
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: riskColor }}
            />
            <p className="text-[11px] tracking-[0.3em] text-zinc-400 uppercase mb-2">Тавсияи мо</p>
            <motion.p
              className="font-black font-mono leading-none mb-1"
              style={{
                fontSize: "clamp(2.5rem, 10vw, 4rem)",
                color: riskColor,
                textShadow: `0 0 40px ${riskColor}`,
              }}
              animate={{ textShadow: [`0 0 20px ${riskColor}80`, `0 0 50px ${riskColor}`, `0 0 20px ${riskColor}80`] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {result}
            </motion.p>
            <p
              className="text-xl font-bold tracking-widest uppercase"
              style={{ color: riskColor, opacity: 0.85 }}
            >
              Lot
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-[9px] tracking-widest text-zinc-500">RISK AMOUNT</p>
                <p className="font-mono text-sm font-bold mt-0.5" style={{ color: riskColor }}>
                  ${riskAmount?.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] tracking-widest text-zinc-500">RISK LEVEL</p>
                <p className="font-mono text-sm font-bold mt-0.5" style={{ color: riskColor }}>
                  {parseFloat(risk) <= 1 ? "🟢 SAFE" : parseFloat(risk) <= 2 ? "🟡 MODERATE" : parseFloat(risk) <= 5 ? "🟠 HIGH" : "🔴 DANGER"}
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl p-6 text-center"
            style={{
              background: "rgba(212,175,55,0.03)",
              border: `1px dashed rgba(212,175,55,0.15)`,
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-3xl mb-2"
            >
              ⚡
            </motion.div>
            <p className="text-xs text-zinc-500 tracking-wider">
              Fill in the fields to calculate your ideal Gold lot size
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

// ─── VIDEO CARD ───────────────────────────────────────────────────────────────
function VideoCard({ lesson, index }: { lesson: VideoLesson; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [playing, setPlaying] = useState(false);
  const tagColor = TAG_COLORS[lesson.tag] ?? GOLD_COLOR;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "rgba(5,5,15,0.8)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? tagColor + "60" : "rgba(212,175,55,0.12)"}`,
        boxShadow: hovered
          ? `0 0 40px ${tagColor}30, 0 16px 40px rgba(0,0,0,0.5)`
          : "0 8px 32px rgba(0,0,0,0.4)",
        transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
      }}
      onClick={() => setPlaying(true)}
    >
      {/* Thumbnail / Player */}
      <div className="relative aspect-video bg-black">
        {playing ? (
          <<img src="/src/assets/video_placeholder.jpg" className="w-full h-full object-cover" alt="Coming Soon" />
        ) : (
          <>
            {/* Thumbnail placeholder */}
            <div
              className="w-full h-full flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #050510 0%, #0d0d1a 50%, rgba(212,175,55,0.05) 100%)`,
              }}
            >
              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `linear-gradient(rgba(212,175,55,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.15) 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Center icon */}
              <motion.div
                animate={hovered ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: hovered ? `linear-gradient(135deg, ${tagColor}, ${tagColor}88)` : "rgba(212,175,55,0.1)",
                  border: `2px solid ${tagColor}`,
                  boxShadow: hovered ? `0 0 30px ${tagColor}` : "none",
                  transition: "all 0.35s ease",
                }}
              >
                <svg viewBox="0 0 24 24" fill={tagColor} className="w-6 h-6 ml-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
              {/* Lesson number */}
              <div
                className="absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                style={{ background: "rgba(0,0,0,0.6)", color: tagColor, border: `1px solid ${tagColor}40` }}
              >
                #{String(index + 1).padStart(2, "0")}
              </div>
              {/* Duration */}
              <div
                className="absolute bottom-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded"
                style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.6)" }}
              >
                ▶ {lesson.duration}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
            style={{ background: `${tagColor}15`, color: tagColor }}
          >
            {lesson.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[9px] font-bold tracking-[0.2em] px-1.5 py-0.5 rounded"
                style={{ background: `${tagColor}15`, color: tagColor, border: `1px solid ${tagColor}30` }}
              >
                {lesson.tag}
              </span>
            </div>
            <p className="font-bold text-sm text-white leading-snug mb-0.5 line-clamp-1">
              {lesson.titleTajik}
            </p>
            <p className="text-[11px] text-zinc-500 line-clamp-1">{lesson.titleEn}</p>
          </div>
          <motion.div
            animate={hovered ? { x: 4, opacity: 1 } : { x: 0, opacity: 0.4 }}
            style={{ color: tagColor }}
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>
      </div>

      {/* Hover glow strip */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5"
        animate={hovered ? { opacity: 1 } : { opacity: 0 }}
        style={{ background: `linear-gradient(90deg, transparent, ${tagColor}, transparent)` }}
      />
    </motion.div>
  );
}

// ─── MARKET STATS BAR ─────────────────────────────────────────────────────────
function MarketBar() {
  const items = [
    { label: "BTC/USD", value: "$104,280", up: true },
    { label: "EUR/USD", value: "1.0812", up: false },
    { label: "OIL/USD", value: "$71.42", up: true },
    { label: "S&P 500", value: "5,872", up: true },
    { label: "DXY", value: "104.32", up: false },
    { label: "BTC/USD", value: "$104,280", up: true },
    { label: "EUR/USD", value: "1.0812", up: false },
    { label: "OIL/USD", value: "$71.42", up: true },
  ];

  return (
    <div
      className="overflow-hidden py-2"
      style={{
        background: "rgba(0,0,0,0.5)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
        backdropFilter: "blur(10px)",
      }}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-xs font-mono">
            <span className="text-zinc-400">{item.label}</span>
            <span style={{ color: item.up ? "#22c55e" : "#ef4444" }}>{item.value}</span>
            <span style={{ color: item.up ? "#22c55e" : "#ef4444" }}>{item.up ? "▲" : "▼"}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
      className="relative z-50 flex items-center justify-between px-5 md:px-8 py-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        borderBottom: "1px solid rgba(212,175,55,0.12)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        {/* ZT Monogram */}
        <motion.div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
          style={{
            background: `linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))`,
            border: `1.5px solid rgba(212,175,55,0.5)`,
            boxShadow: `0 0 20px rgba(212,175,55,0.3), inset 0 1px 0 rgba(212,175,55,0.2)`,
            color: GOLD_COLOR,
          }}
          whileHover={{ scale: 1.08, boxShadow: `0 0 35px rgba(212,175,55,0.5)` }}
          animate={{
            boxShadow: [
              `0 0 15px rgba(212,175,55,0.2)`,
              `0 0 30px rgba(212,175,55,0.4)`,
              `0 0 15px rgba(212,175,55,0.2)`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ZT
        </motion.div>
        <div>
          <motion.h1
            className="font-black text-sm md:text-base tracking-[0.15em] uppercase leading-none"
            style={{
              color: GOLD_COLOR,
              textShadow: `0 0 20px rgba(212,175,55,0.5)`,
            }}
            animate={{
              textShadow: [
                `0 0 10px rgba(212,175,55,0.3)`,
                `0 0 25px rgba(212,175,55,0.6)`,
                `0 0 10px rgba(212,175,55,0.3)`,
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            ZT ACADEMY
          </motion.h1>
          <p className="text-[9px] tracking-[0.3em] text-zinc-500 mt-0.5 uppercase">
            Trading Terminal · Tajikistan
          </p>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex items-center gap-3">
        {/* Instagram */}
        <motion.a
          href="https://instagram.com/ziyorat_trade"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center group"
          style={{
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)` }}
          />
          <InstagramIcon size={16} color={GOLD_COLOR} />
        </motion.a>

        {/* Telegram */}
        <motion.a
          href="https://t.me/ziyorat_trade"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center group"
          style={{
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.2)",
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)` }}
          />
          {/* Custom Telegram icon */}
          <Send size={15} style={{ color: GOLD_COLOR }} />
        </motion.a>
      </div>
    </motion.header>
  );
}

// ─── SECTION TITLE ─────────────────────────────────────────────────────────────
function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: GOLD_SOFT, color: GOLD_COLOR, border: `1px solid rgba(212,175,55,0.25)` }}
      >
        {icon}
      </div>
      <div>
        <h2 className="font-bold text-sm tracking-wider uppercase" style={{ color: GOLD_COLOR }}>
          {title}
        </h2>
        <p className="text-[10px] text-zinc-500 tracking-widest">{sub}</p>
      </div>
      <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(90deg, rgba(212,175,55,0.3), transparent)` }} />
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="mt-12 pb-8 px-5 md:px-8 text-center"
      style={{ borderTop: "1px solid rgba(212,175,55,0.08)" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="pt-8"
      >
        <p
          className="font-black text-lg tracking-[0.3em] uppercase mb-1"
          style={{ color: GOLD_COLOR, textShadow: `0 0 20px rgba(212,175,55,0.3)` }}
        >
          ZT ACADEMY
        </p>
        <p className="text-[10px] text-zinc-500 tracking-widest mb-4">
          Tajikistan's Premier Trading School · Est. 2024
        </p>
        <div className="flex items-center justify-center gap-6">
          <a
            href="https://instagram.com/ziyorat_trade"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] text-zinc-400 hover:text-yellow-400 transition-colors"
          >
            <InstagramIcon size={13} color="currentColor" />
            @ziyorat_trade
          </a>
          <span className="text-zinc-700">·</span>
          <a
            href="https://t.me/ziyorat_trade"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] text-zinc-400 hover:text-yellow-400 transition-colors"
          >
            <Send size={13} />
            t.me/ziyorat_trade
          </a>
        </div>
        <p className="text-[9px] text-zinc-700 mt-4 tracking-widest">
          © 2077 ZT ACADEMY · FOR EDUCATIONAL PURPOSES ONLY · TRADE RESPONSIBLY
        </p>
      </motion.div>
    </footer>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ── BACKGROUND LAYER ── */}
      <div className="fixed inset-0 z-0">
        {/* Tajikistan Flag / Mountain background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/tajikistan_bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            filter: "blur(3px) brightness(0.45) saturate(1.2)",
            transform: "scale(1.05)",
          }}
        />
        {/* Dark glassmorphism overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg,
                rgba(0,0,0,0.75) 0%,
                rgba(5,5,20,0.65) 30%,
                rgba(5,5,20,0.70) 70%,
                rgba(0,0,0,0.85) 100%
              )
            `,
          }}
        />
        {/* Gold radial ambient */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 40% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 30% at 100% 100%, rgba(212,175,55,0.05) 0%, transparent 50%)
            `,
          }}
        />
        {/* Tajikistan flag color strip (subtle) */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg, #cc0000, #cc0000 33%, #ffffff 33%, #ffffff 66%, #006600 66%)", opacity: 0.6 }}
        />
      </div>

      {/* ── SCAN LINES ── */}
      <ScanLines />

      {/* ── CONTENT ── */}
      <div className="relative z-10">
        <Header />
        <MarketBar />

        <AnimatePresence>
          {mounted && (
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-5xl mx-auto px-4 md:px-6 py-8"
            >
              {/* ── HERO BANNER ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-10"
              >
                <motion.p
                  className="text-[10px] tracking-[0.5em] text-zinc-400 uppercase mb-3"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ◆ Tajikistan's #1 Trading Platform ◆
                </motion.p>
                <h2
                  className="font-black leading-tight mb-3"
                  style={{
                    fontSize: "clamp(1.8rem, 6vw, 3.5rem)",
                    background: `linear-gradient(135deg, #fff 0%, ${GOLD_COLOR} 50%, #fff 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                  }}
                >
                  Trade Gold Like a Pro
                </h2>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                  Master Smart Money Concepts · Real-time Analytics · Professional Risk Management
                </p>
              </motion.div>

              {/* ── LIVE GOLD PRICE ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <SectionTitle
                  icon={<TrendingUp size={16} />}
                  title="Live Gold Price"
                  sub="XAU/USD · REAL-TIME MARKET FEED"
                />
                <GoldTicker />
              </motion.div>

              {/* ── RISK CALCULATOR ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                <SectionTitle
                  icon={<Shield size={16} />}
                  title="SMC Risk Calculator"
                  sub="GOLD (XAU/USD) · POSITION SIZE ENGINE"
                />
                <RiskCalculator />
              </motion.div>

              {/* ── VIDEO HUB ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-6"
              >
                <SectionTitle
                  icon={<BookOpen size={16} />}
                  title="Video Academy"
                  sub="ТАДҚИҚОТИ КАСБИИ САВДО · PROFESSIONAL TRADING CURRICULUM"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VIDEO_LESSONS.map((lesson, i) => (
                    <VideoCard key={lesson.id} lesson={lesson} index={i} />
                  ))}
                </div>
              </motion.div>

              {/* ── STATS STRIP ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { val: "5,000+", label: "Донишҷӯён", sub: "Active Students", icon: "👥" },
                    { val: "98%", label: "Муваффақият", sub: "Success Rate", icon: "🏆" },
                    { val: "24/7", label: "Дастрасӣ", sub: "Always Available", icon: "⚡" },
                    { val: "#1", label: "Тоҷикистон", sub: "In Tajikistan", icon: "🥇" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="rounded-xl p-4 text-center relative overflow-hidden group"
                      style={{
                        background: "rgba(5,5,15,0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(212,175,55,0.15)",
                      }}
                      whileHover={{
                        borderColor: "rgba(212,175,55,0.4)",
                        boxShadow: `0 0 25px rgba(212,175,55,0.15)`,
                      }}
                    >
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <p className="font-black text-xl" style={{ color: GOLD_COLOR }}>{stat.val}</p>
                      <p className="text-xs font-bold text-white/80 mt-0.5">{stat.label}</p>
                      <p className="text-[9px] text-zinc-500 tracking-widest">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ── CTA ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8 rounded-2xl overflow-hidden relative"
                style={{
                  background: `linear-gradient(135deg, rgba(5,5,15,0.9) 0%, rgba(212,175,55,0.08) 100%)`,
                  border: "1px solid rgba(212,175,55,0.25)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
                    backgroundSize: "30px 30px",
                  }}
                />
                <div className="relative z-10 p-8 text-center">
                  <motion.p
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="text-[10px] tracking-[0.4em] text-zinc-400 uppercase mb-3"
                  >
                    ◆ Start Your Journey ◆
                  </motion.p>
                  <h3
                    className="font-black text-2xl md:text-3xl mb-3"
                    style={{
                      background: `linear-gradient(135deg, #fff 0%, ${GOLD_COLOR} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Ба ZT Academy ҳамроҳ шавед
                  </h3>
                  <p className="text-sm text-zinc-400 mb-6 max-w-sm mx-auto">
                    Join thousands of Tajik traders mastering Smart Money Concepts and Gold trading.
                  </p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <motion.a
                      href="https://t.me/ziyorat_trade"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${GOLD_GLOW}` }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wider"
                      style={{
                        background: `linear-gradient(135deg, ${GOLD_COLOR}, #b8960c)`,
                        color: "#000",
                        boxShadow: `0 4px 20px rgba(212,175,55,0.4)`,
                      }}
                    >
                      <Send size={15} />
                      Telegram Channel
                    </motion.a>
                    <motion.a
                      href="https://instagram.com/ziyorat_trade"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm tracking-wider"
                      style={{
                        background: "rgba(212,175,55,0.1)",
                        color: GOLD_COLOR,
                        border: `1px solid rgba(212,175,55,0.35)`,
                      }}
                    >
                      <InstagramIcon size={15} color={GOLD_COLOR} />
                      Instagram
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </motion.main>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
}

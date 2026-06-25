import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Zap, Flame, RefreshCw } from "lucide-react";

interface ArcReactorProps {
  isSpeaking: boolean;
  isProcessing: boolean;
  powerLevel: number;
  setPowerLevel: (val: number) => void;
}

export default function ArcReactor({
  isSpeaking,
  isProcessing,
  powerLevel,
  setPowerLevel,
}: ArcReactorProps) {
  const [rotationSpeed, setRotationSpeed] = useState(1); // multiplier
  const [coreTemp, setCoreTemp] = useState(38.4); // °C
  const [integrity, setIntegrity] = useState(100);

  // Dynamic simulation of core temperature based on power level
  useEffect(() => {
    const interval = setInterval(() => {
      // Temperature moves toward a target proportional to power level
      const targetTemp = 30 + (powerLevel * 0.45) + (isProcessing ? 10 : 0);
      setCoreTemp((prev) => {
        const diff = targetTemp - prev;
        const step = diff * 0.1 + (Math.random() - 0.5) * 0.5;
        return parseFloat((prev + step).toFixed(1));
      });

      // Integrity slowly drifts or drops if temperature gets too high (> 75°C)
      setIntegrity((prev) => {
        if (coreTemp > 75) {
          return Math.max(70, parseFloat((prev - 0.1).toFixed(1)));
        } else if (prev < 100) {
          return Math.min(100, parseFloat((prev + 0.05).toFixed(1)));
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [powerLevel, isProcessing, coreTemp]);

  // Speed multiplier based on reactor status
  const currentSpeed = isProcessing ? 15 : isSpeaking ? 10 : 5;

  return (
    <div id="arc-reactor-card" className="relative flex flex-col items-center justify-between h-full p-5 overflow-hidden border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
      {/* HUD Header */}
      <div className="flex items-center justify-between w-full border-b border-cyan-500/10 pb-2">
        <span className="font-mono text-xs text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-cyan-400" /> CORE VECTOR: MK-VIII
        </span>
        <span className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${
          integrity > 90 ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
        }`}>
          INTEGRITY: {integrity}%
        </span>
      </div>

      {/* Main Circular Reactor Element */}
      <div className="relative flex items-center justify-center my-6 h-52 w-52">
        {/* Outer Grid Accent */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/5" />
        <div className="absolute inset-4 rounded-full border border-dashed border-cyan-500/10" />

        {/* Pulsing Outer Glow Ring */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.08, 1] : isProcessing ? [1, 1.04, 1] : [1, 1.02, 1],
            opacity: isSpeaking ? [0.6, 0.9, 0.6] : [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: isSpeaking ? 0.6 : isProcessing ? 1.2 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-6 rounded-full bg-cyan-500/5 blur-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]"
        />

        {/* Layer 1: Outer Chrono-Ring (Clockwise) */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{
            duration: 25 / (currentSpeed * 0.2),
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-8 w-36 h-36 text-cyan-500/30"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="15 8 5 4 8 10"
          />
        </motion.svg>

        {/* Layer 2: Middle Arc-Chamber (Counter-Clockwise) */}
        <motion.svg
          animate={{ rotate: -360 }}
          transition={{
            duration: 12 / (currentSpeed * 0.25),
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-10 w-32 h-32 text-cyan-400"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray="25 15 8 10"
            className="filter drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]"
          />
        </motion.svg>

        {/* Layer 3: Dynamic Audio Ring (Speaks/Pulses) */}
        <motion.svg
          animate={{
            scale: isSpeaking ? [1, 1.15, 0.95, 1.1, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isSpeaking ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="absolute inset-12 w-28 h-28 text-cyan-300"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4 12 6"
          />
        </motion.svg>

        {/* Layer 4: Triangular Core Alignment Structure */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 40 / (currentSpeed * 0.1),
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-14 flex items-center justify-center"
        >
          <div className="w-24 h-24 relative flex items-center justify-center">
            {/* Triangular alignment vectors */}
            {[0, 120, 240].map((angle, i) => (
              <div
                key={i}
                style={{ transform: `rotate(${angle}deg)` }}
                className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-cyan-400/20"
              />
            ))}
          </div>
        </motion.div>

        {/* Layer 5: Bright Core Center */}
        <motion.div
          animate={{
            scale: isSpeaking ? [0.95, 1.12, 0.95] : isProcessing ? [0.98, 1.05, 0.98] : [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: isSpeaking ? 0.4 : 1.5,
            repeat: Infinity,
          }}
          className="absolute inset-18 flex items-center justify-center rounded-full bg-slate-900 border border-cyan-400/50 shadow-[inset_0_0_15px_rgba(6,182,212,0.8)]"
        >
          {/* Inner Light node */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
            coreTemp > 75 ? "bg-red-500/80 shadow-[0_0_20px_#ef4444]" : "bg-cyan-400 shadow-[0_0_20px_#22d3ee]"
          }`}>
            <Zap className="w-4 h-4 text-slate-950 font-bold" />
          </div>
        </motion.div>
      </div>

      {/* Interactive Controls & Real-Time Stats */}
      <div className="w-full space-y-4">
        {/* Core telemetry */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs border-t border-cyan-500/10 pt-4">
          <div className="bg-slate-900/60 p-2 rounded border border-cyan-500/5 flex flex-col justify-center">
            <div className="text-[10px] text-cyan-500/60 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> OUTPUT LEVEL
            </div>
            <div className="text-lg font-semibold text-cyan-300 mt-0.5">
              {(1.2 * (powerLevel / 100)).toFixed(2)} <span className="text-xs">GW</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2 rounded border border-cyan-500/5 flex flex-col justify-center">
            <div className="text-[10px] text-cyan-500/60 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" /> CORE TEMP
            </div>
            <div className={`text-lg font-semibold mt-0.5 transition-colors ${
              coreTemp > 70 ? "text-red-400" : coreTemp > 50 ? "text-amber-400" : "text-cyan-300"
            }`}>
              {coreTemp}°C
            </div>
          </div>
        </div>

        {/* Reactor Power Adjustment Slider */}
        <div className="space-y-1 bg-slate-900/40 p-2.5 rounded border border-cyan-500/5">
          <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
            <span>REACTOR FLUX CAPACITANCE</span>
            <span>{powerLevel}%</span>
          </div>
          <input
            id="reactor-flux-input"
            type="range"
            min="10"
            max="100"
            value={powerLevel}
            onChange={(e) => setPowerLevel(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-1 rounded-lg cursor-pointer"
          />
        </div>

        {/* Footer Subsystems check */}
        <div className="flex justify-between items-center text-[9px] font-mono text-cyan-500/40">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            SYNAPSE NETWORK: SECURE
          </span>
          <span className="flex items-center gap-0.5">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" /> FREQ: 4.8 THz
          </span>
        </div>
      </div>
    </div>
  );
}

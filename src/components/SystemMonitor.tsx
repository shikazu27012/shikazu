import React, { useState, useEffect, useRef } from "react";
import { Cpu, Database, Activity, Wifi, Terminal, HardDrive } from "lucide-react";
import { SystemMetric } from "../types";

interface SystemMonitorProps {
  powerLevel: number;
  wsStatus: "connected" | "disconnected" | "diagnosing" | "recovering";
  onSimulateInterruption: () => void;
  onFixWs?: () => void;
  flashStatus: "healthy" | "critical" | "recovering";
  onSimulateFlashFail: () => void;
  onFixFlash?: () => void;
}

export default function SystemMonitor({
  powerLevel,
  wsStatus,
  onSimulateInterruption,
  onFixWs,
  flashStatus,
  onSimulateFlashFail,
  onFixFlash
}: SystemMonitorProps) {
  const [metric, setMetric] = useState<SystemMetric>({
    cpuUsage: 14.5,
    cpuTemp: 41,
    ramUsage: 4.22,
    ramMax: 16.0,
    networkUpload: 24.3,
    networkDownload: 182.4,
    arcReactorPower: powerLevel,
    timestamp: new Date().toLocaleTimeString(),
  });

  // Keep a small history of CPU measurements to draw a dynamic sparkline
  const [cpuHistory, setCpuHistory] = useState<number[]>([15, 22, 12, 18, 30, 25, 14, 19, 21, 16, 28, 15]);
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Generate mock diagnostics
  useEffect(() => {
    const diagnosticMsgs = [
      "SYNAPSE: Synaptic links established.",
      "SUBROUTINE: Audio feedback loops calibrated.",
      "DIAGNOSTIC: Thermonuclear feedback loops normalized.",
      "SECURITY: Firewall blocks synchronized.",
      "NET: Downlink telemetry stable on 12-channel band.",
      "VM: Allocating memory stack for compiler buffers.",
      "ARC REACTOR: Output resonance flux in stable bounds.",
      "PROCESSOR: Multi-thread hyper-threading synced.",
      "TELEMETRY: Background operations scanning folders...",
      "SPEECH: Natural speech engine active at 24000Hz PCM.",
    ];

    setLogs([
      "SYSTEM INIT: Initialize JARVIS Kernel...",
      "DATABASE: Stark Industrial cloud cluster connected.",
      "PERFORMANCE: Diagnostic sweep completed. Status: Green.",
    ]);

    const interval = setInterval(() => {
      // Calculate realistic metrics relative to reactor power level
      const cpuFluctuation = Math.min(
        100,
        Math.max(2, Math.round(5 + Math.random() * 15 + (powerLevel > 80 ? 12 : 0)))
      );
      const tempFluctuation = Math.round(35 + (powerLevel * 0.25) + Math.random() * 4);
      const ramFluctuation = parseFloat((4.1 + Math.random() * 0.4 + (powerLevel > 70 ? 0.3 : 0)).toFixed(2));
      const upFluctuation = parseFloat((15 + Math.random() * 18).toFixed(1));
      const downFluctuation = parseFloat((120 + Math.random() * 90).toFixed(1));

      setMetric({
        cpuUsage: cpuFluctuation,
        cpuTemp: tempFluctuation,
        ramUsage: ramFluctuation,
        ramMax: 16.0,
        networkUpload: upFluctuation,
        networkDownload: downFluctuation,
        arcReactorPower: powerLevel,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Update CPU history sparkline
      setCpuHistory((prev) => [...prev.slice(1), cpuFluctuation]);

      // Randomly append a diagnostics log line
      if (Math.random() > 0.4) {
        const randomMsg = diagnosticMsgs[Math.floor(Math.random() * diagnosticMsgs.length)];
        const timeStr = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev.slice(-30), `[${timeStr}] ${randomMsg}`]);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [powerLevel]);

  // Auto scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Convert CPU history into a nice SVG line path
  const width = 280;
  const height = 40;
  const padding = 2;
  const maxCpu = 100;
  const points = cpuHistory
    .map((val, index) => {
      const x = (index / (cpuHistory.length - 1)) * (width - padding * 2) + padding;
      const y = height - (val / maxCpu) * (height - padding * 2) - padding;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div id="system-monitor-card" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-4">
        <span className="font-mono text-xs text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> SYSTEM DIAGNOSTICS
        </span>
        <span className="font-mono text-[10px] text-cyan-500/50">
          Uptime: <span className="text-cyan-400">18:42:09</span>
        </span>
      </div>

      {/* Grid of Gauges */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* CPU */}
        <div className="bg-slate-900/40 border border-cyan-500/5 rounded p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1.5">
            <span className="flex items-center gap-1 text-[10px] tracking-wider text-cyan-500/60">
              <Cpu className="w-3.5 h-3.5" /> CPU OVERLOAD
            </span>
            <span>{metric.cpuUsage}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-500/10">
            <div
              style={{ width: `${metric.cpuUsage}%` }}
              className={`h-full transition-all duration-1000 ${
                metric.cpuUsage > 80
                  ? "bg-red-500 shadow-[0_0_8px_#ef4444]"
                  : metric.cpuUsage > 50
                  ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
              }`}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-cyan-500/50">
            <span>TEMP: {metric.cpuTemp}°C</span>
            <span>CORES: 32 Thr</span>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-900/40 border border-cyan-500/5 rounded p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-cyan-400 mb-1.5">
            <span className="flex items-center gap-1 text-[10px] tracking-wider text-cyan-500/60">
              <Database className="w-3.5 h-3.5" /> MEMORY STACK
            </span>
            <span>{Math.round((metric.ramUsage / metric.ramMax) * 100)}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-500/10">
            <div
              style={{ width: `${(metric.ramUsage / metric.ramMax) * 100}%` }}
              className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all duration-1000"
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-cyan-500/50">
            <span>USED: {metric.ramUsage} GB</span>
            <span>MAX: {metric.ramMax} GB</span>
          </div>
        </div>
      </div>

      {/* Network Bandwidth Panel */}
      <div className="bg-slate-900/40 border border-cyan-500/5 rounded p-3 mb-4">
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-500/60 mb-2">
          <span className="flex items-center gap-1 uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Bandwidth Matrix
          </span>
          <span className="text-cyan-400">SECURE LINK (TLS v1.3)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2 border-b border-cyan-500/5 pb-2">
          <div className="border-r border-cyan-500/10 pr-2">
            <span className="text-[10px] text-cyan-500/40 block">UPLINK STREAM</span>
            <span className="text-cyan-300 font-medium">{metric.networkUpload} Mbps</span>
          </div>
          <div className="pl-2">
            <span className="text-[10px] text-cyan-500/40 block">DOWNLINK FLUX</span>
            <span className="text-cyan-300 font-medium">{metric.networkDownload} Mbps</span>
          </div>
        </div>

        {/* WebSocket Status Indicator */}
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex flex-col">
            <span className="text-[9px] text-cyan-500/40 uppercase">WS Synapse Connection</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                wsStatus === "connected"
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"
                  : wsStatus === "disconnected"
                  ? "bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]"
                  : wsStatus === "diagnosing"
                  ? "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"
                  : "bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]"
              }`} />
              <span className={`font-semibold uppercase text-[10px] tracking-wide ${
                wsStatus === "connected"
                  ? "text-emerald-400"
                  : wsStatus === "disconnected"
                  ? "text-red-400"
                  : wsStatus === "diagnosing"
                  ? "text-amber-400"
                  : "text-cyan-400 animate-pulse"
              }`}>
                {wsStatus}
              </span>
            </div>
          </div>
          
          {wsStatus === "connected" ? (
            <button
              onClick={onSimulateInterruption}
              className="px-2 py-1 text-[9px] uppercase border font-semibold rounded transition-all bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 active:scale-95"
            >
              Interrupt WS Link
            </button>
          ) : (
            <button
              onClick={onFixWs}
              className="px-2 py-1 text-[9px] uppercase border font-bold rounded transition-all bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border-emerald-500/30 active:scale-95 animate-pulse"
            >
              Align WS Handshake
            </button>
          )}
        </div>

        {/* Flash Storage Status Indicator */}
        <div className="flex items-center justify-between font-mono text-xs mt-3 pt-3 border-t border-cyan-500/5">
          <div className="flex flex-col">
            <span className="text-[9px] text-cyan-500/40 uppercase">Flash Storage Cache</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                flashStatus === "healthy"
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]"
                  : flashStatus === "critical"
                  ? "bg-red-500 animate-ping shadow-[0_0_8px_#ef4444]"
                  : "bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"
              }`} />
              <span className={`font-semibold uppercase text-[10px] tracking-wide ${
                flashStatus === "healthy"
                  ? "text-emerald-400"
                  : flashStatus === "critical"
                  ? "text-red-400 font-bold"
                  : "text-amber-400 animate-pulse"
              }`}>
                {flashStatus === "healthy" ? "HEALTHY" : flashStatus === "critical" ? "FLASH FAIL" : "RECOVERING"}
              </span>
            </div>
          </div>
          
          {flashStatus === "healthy" ? (
            <button
              onClick={onSimulateFlashFail}
              className="px-2 py-1 text-[9px] uppercase border font-semibold rounded transition-all bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20 active:scale-95"
            >
              Simulate Flash Error
            </button>
          ) : (
            <button
              onClick={onFixFlash}
              className="px-2 py-1 text-[9px] uppercase border font-bold rounded transition-all bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border-emerald-500/30 active:scale-95 animate-pulse"
            >
              Recover Flash Sectors
            </button>
          )}
        </div>
      </div>

      {/* CPU Usage Sparkline Chart */}
      <div className="bg-slate-900/30 border border-cyan-500/5 rounded p-3 mb-4 flex flex-col justify-between">
        <span className="font-mono text-[9px] text-cyan-500/40 uppercase tracking-widest mb-1">
          Processor Real-time Oscilloscope
        </span>
        <div className="h-10 w-full bg-slate-950/80 rounded border border-cyan-500/10 flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid Lines */}
            <line x1="0" y1="10" x2={width} y2="10" stroke="rgba(6,182,212,0.05)" strokeWidth="0.5" />
            <line x1="0" y1="20" x2={width} y2="20" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
            <line x1="0" y1="30" x2={width} y2="30" stroke="rgba(6,182,212,0.05)" strokeWidth="0.5" />

            {/* Sparkline Area */}
            <path
              d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
              fill="url(#sparkline-grad)"
              className="transition-all duration-1000"
            />
            {/* Sparkline Path */}
            <polyline
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              points={points}
              className="transition-all duration-1000"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.25)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Terminal Telemetry Sub-Logs */}
      <div className="flex-1 min-h-[120px] flex flex-col bg-slate-950/90 border border-cyan-500/10 rounded p-2.5 font-mono text-[10px] text-cyan-500/80">
        <div className="flex items-center gap-1 border-b border-cyan-500/10 pb-1 mb-1.5 text-[9px] uppercase tracking-wider text-cyan-400">
          <Terminal className="w-3 h-3 text-cyan-400" /> Jarvis-OS Subroutine Kernel Logs
        </div>
        <div
          ref={logsContainerRef}
          className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[180px] scrollbar-thin scrollbar-thumb-cyan-500/20"
        >
          {logs.map((log, idx) => (
            <div key={idx} className="whitespace-nowrap leading-tight font-light truncate">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

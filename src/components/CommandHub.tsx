import React, { useState } from "react";
import { Play, RotateCw, Power, Server, Cpu, PlayCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Application, AutomationWorkflow } from "../types";

interface CommandHubProps {
  onTriggerLog: (text: string, type: "system" | "success" | "error") => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export default function CommandHub({ onTriggerLog, isProcessing, setIsProcessing }: CommandHubProps) {
  // Application Management State
  const [apps, setApps] = useState<Application[]>([
    { id: "1", name: "Visual Studio Code", category: "development", status: "running", pid: 8145, cpu: 2.1, ram: 420 },
    { id: "2", name: "Google Chrome Core", category: "communication", status: "running", pid: 10421, cpu: 1.8, ram: 840 },
    { id: "3", name: "Stark Synapse Terminal", category: "system", status: "running", pid: 9005, cpu: 0.5, ram: 110 },
    { id: "4", name: "Holographic Media Deck", category: "media", status: "idle", pid: 3120, cpu: 0.0, ram: 45 },
    { id: "5", name: "AI Python Sandbox", category: "development", status: "terminated", pid: 0, cpu: 0.0, ram: 0 },
  ]);

  // Automation Workflows State
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: "w1",
      name: "Stark Workspace Setup",
      trigger: "Workspace Init",
      steps: ["Creating folder structure", "Configuring virtual env", "Booting VS Code", "Syncing workspace git"],
      active: true,
    },
    {
      id: "w2",
      name: "Core Diagnostic Sweep",
      trigger: "Diagnostic Run",
      steps: ["Flushing memory stacks", "Calibrating thermal rods", "Optimizing socket links"],
      active: true,
    },
    {
      id: "w3",
      name: "Security Lockdown Protocol",
      trigger: "Lockdown OS",
      steps: ["Enabling absolute firewalls", "Terminating external ports", "Verifying token signatures"],
      active: false,
    },
  ]);

  // Action: Toggle Application Power
  const toggleApp = (id: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const isStopping = app.status === "running";
          const newStatus = isStopping ? "terminated" : "running";
          const newPid = isStopping ? 0 : Math.floor(Math.random() * 9000) + 1000;
          const newCpu = isStopping ? 0 : parseFloat((Math.random() * 4 + 1).toFixed(1));
          const newRam = isStopping ? 0 : Math.floor(Math.random() * 300) + 100;

          onTriggerLog(
            `${isStopping ? "TERMINATED" : "LAUNCHED"} subroutine: ${app.name} (PID: ${newPid})`,
            isStopping ? "error" : "success"
          );

          return { ...app, status: newStatus, pid: newPid, cpu: newCpu, ram: newRam };
        }
        return app;
      })
    );
  };

  // Action: Optimize Application CPU/RAM
  const optimizeApp = (id: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === id && app.status === "running") {
          const optimizedCpu = parseFloat((app.cpu * 0.5).toFixed(1));
          const optimizedRam = Math.floor(app.ram * 0.8);

          onTriggerLog(`OPTIMIZED resources for: ${app.name}. CPU freed, RAM cached.`, "success");

          return { ...app, cpu: optimizedCpu, ram: optimizedRam };
        }
        return app;
      })
    );
  };

  // Action: Run Automation Workflow
  const executeWorkflow = async (workflow: AutomationWorkflow) => {
    if (isProcessing) return;
    setIsProcessing(true);
    onTriggerLog(`TRIGGERED WORKFLOW: "${workflow.name}"`, "system");

    // Sequential steps simulation
    for (let i = 0; i < workflow.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      onTriggerLog(`[STEP ${i + 1}/${workflow.steps.length}] ${workflow.steps[i]}... Done`, "system");
    }

    onTriggerLog(`WORKFLOW COMPLETE: "${workflow.name}" executed successfully.`, "success");
    setIsProcessing(false);
  };

  // Toggle Workflow Activability
  const toggleWorkflowActive = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  return (
    <div id="command-hub-card" className="flex flex-col h-full border border-cyan-500/20 rounded-xl bg-slate-950/80 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2 mb-3">
        <span className="font-mono text-xs text-cyan-400 tracking-wider flex items-center gap-1.5">
          <Server className="w-4 h-4 text-cyan-400" /> PROGRAM CONTROL CENTRAL
        </span>
        <span className="font-mono text-[10px] text-cyan-500/50">
          PROCS: {apps.filter((a) => a.status === "running").length} ACTIVE
        </span>
      </div>

      {/* Applications list */}
      <div className="space-y-2 mb-4">
        <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest mb-1">
          Subsystems Interface
        </div>
        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {apps.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between p-1.5 bg-slate-900/40 hover:bg-slate-900/70 border border-cyan-500/5 hover:border-cyan-500/15 rounded transition-all font-mono text-xs"
            >
              <div className="flex items-center gap-2">
                {/* Status Dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    app.status === "running"
                      ? "bg-emerald-500 shadow-[0_0_5px_#10b981]"
                      : app.status === "idle"
                      ? "bg-amber-400"
                      : "bg-slate-600"
                  }`}
                />
                <div className="flex flex-col">
                  <span className="text-cyan-300 font-medium text-[11px] leading-tight">{app.name}</span>
                  <span className="text-[9px] text-cyan-500/50">
                    {app.status === "running"
                      ? `PID: ${app.pid} | CPU: ${app.cpu}% | RAM: ${app.ram}MB`
                      : "INACTIVE"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {app.status === "running" && (
                  <button
                    onClick={() => optimizeApp(app.id)}
                    className="p-1 text-[10px] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded transition-colors border border-cyan-500/10"
                    title="Optimize RAM"
                  >
                    <Cpu className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => toggleApp(app.id)}
                  className={`p-1 text-[10px] rounded transition-colors border ${
                    app.status === "running"
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10"
                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/10"
                  }`}
                  title={app.status === "running" ? "Deactivate" : "Activate"}
                >
                  <Power className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflows / Macros divider */}
      <div className="border-t border-cyan-500/10 pt-3 flex flex-col flex-1">
        <div className="text-[10px] font-mono text-cyan-500/50 uppercase tracking-widest mb-1.5">
          Synaptic Automation Workflows
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[160px] flex-1">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-2 bg-slate-900/30 border border-cyan-500/5 rounded font-mono text-xs flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className="text-cyan-300 font-medium">{workflow.name}</span>
                <span className="text-[9px] text-cyan-500/40">
                  Macro: "{workflow.trigger}" | {workflow.steps.length} sub-tasks
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Trigger */}
                <button
                  onClick={() => toggleWorkflowActive(workflow.id)}
                  className="text-cyan-500/60 hover:text-cyan-400 transition-colors"
                >
                  {workflow.active ? (
                    <ToggleRight className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                <button
                  onClick={() => executeWorkflow(workflow)}
                  disabled={isProcessing || !workflow.active}
                  className={`p-1 rounded transition-colors border ${
                    !workflow.active
                      ? "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                      : isProcessing
                      ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/10 animate-pulse"
                      : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30"
                  }`}
                  title="Run Workflow"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

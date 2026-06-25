/**
 * Types and interfaces for the JARVIS OS Environment
 */

export interface SystemMetric {
  cpuUsage: number;
  cpuTemp: number;
  ramUsage: number; // GB
  ramMax: number;   // GB
  networkUpload: number; // Mbps
  networkDownload: number; // Mbps
  arcReactorPower: number; // %
  timestamp: string;
}

export interface Application {
  id: string;
  name: string;
  category: "productivity" | "development" | "system" | "communication" | "media";
  status: "running" | "idle" | "terminated";
  pid: number;
  cpu: number; // current cpu usage %
  ram: number; // current ram usage MB
}

export interface VirtualFile {
  id: string;
  name: string;
  path: string;
  type: "file" | "folder";
  extension?: string;
  content?: string;
}

export interface ReminderTask {
  id: string;
  title: string;
  time: string;
  category: "work" | "personal" | "system" | "security";
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface TerminalLog {
  id: string;
  timestamp: string;
  type: "user" | "jarvis" | "system" | "error" | "success";
  text: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  active: boolean;
}

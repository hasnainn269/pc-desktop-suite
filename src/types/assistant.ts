export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export interface FileItem {
  id: string;
  name: string;
  path: string;
  isDir: boolean;
  size?: number;
  updatedAt?: number;
  content?: string;
}

export interface StoragePartition {
  driveLetter: string;
  label: string;
  fileSystem: string;
  totalGB: number;
  usedGB: number;
  freeGB: number;
  percent: number;
  type: "SSD" | "HDD" | "NVMe";
}

export interface SystemMetrics {
  hostname: string;
  deviceName: string;
  windowsEdition: string;
  windowsVersion: string;
  osBuild: string;
  platform: string;
  systemType: string;
  licenseStatus: string;
  // Processor
  cpuModel: string;
  cpuGeneration: string;
  cpuArchitecture: string;
  cpuCores: number;
  cpuThreads: number;
  cpuSpeedGHz: number;
  cpuUsage: number;
  cpuTemperatureC: number;
  perCoreUsage: number[];
  // RAM
  ramTotalGB: number;
  ramUsedGB: number;
  ramFreeGB: number;
  ramPercent: number;
  ramType: string;
  ramSpeedMHz: number;
  ramSlots: string;
  // ROM / Storage
  romTotalGB: number;
  romUsedGB: number;
  romFreeGB: number;
  romPercent: number;
  romType: string;
  partitions: StoragePartition[];
  // GPU / Graphics
  gpuModel: string;
  gpuVramGB: number;
  gpuUsagePercent: number;
  // System Board & Power
  motherboard: string;
  biosVersion: string;
  secureBoot: boolean;
  tpmStatus: string;
  uptimeSeconds: number;
  nodeVersion: string;
  battery: {
    percent: number;
    charging: boolean;
    health: string;
    remainingMinutes: number;
  };
  network: {
    status: string;
    adapterName: string;
    ipAddress: string;
    pingMs: number;
  };
}

export interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: "You" | "Assistant";
  message: string;
  time: string;
}

export interface PDFDocument {
  id: string;
  name: string;
  path: string;
  pages: number;
  wordCount: number;
  text: string;
  base64Data?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  priority: "High" | "Medium" | "Low";
  category: "Work" | "Personal" | "Study" | "System";
  dueDate?: string;
  createdAt: number;
}

export interface VaultCredential {
  id: string;
  title: string;
  username: string;
  password: string;
  category: "Social" | "Work" | "Banking" | "API Keys" | "Other";
  notes?: string;
  updatedAt: number;
}

export interface RunningProcess {
  pid: number;
  name: string;
  cpuPercent: number;
  memoryMB: number;
  status: "Running" | "Sleeping" | "Active";
}

export interface JunkCategory {
  id: string;
  name: string;
  description: string;
  sizeMB: number;
  selected: boolean;
}

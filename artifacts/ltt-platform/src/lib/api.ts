const BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("ltt_token");
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts?.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface AgentRequest {
  id: number;
  requestId: string;
  agentId: number | null;
  entityType: string;
  services: string[] | null;
  staffCount: number | null;
  representativeName: string;
  representativeEmail: string | null;
  agentName: string;
  mobile: string;
  landline: string | null;
  agentEmail: string | null;
  city: string;
  fullAddress: string | null;
  activityType: string | null;
  latitude: number | null;
  longitude: number | null;
  locationDescription: string | null;
  hasSignboard: boolean | null;
  hasDevices: boolean | null;
  internetQuality: string | null;
  staffReadiness: string | null;
  areaTraffic: string | null;
  marketDensitySameCity: string | null;
  marketDensitySameStreet: string | null;
  transactionVolumeAdsl: string | null;
  transactionVolume4g: string | null;
  documentsComplete: boolean | null;
  brandIdentityCompliant: boolean | null;
  notes: string | null;
  readinessScore: number | null;
  salesScore: number | null;
  complianceScore: number | null;
  finalScore: number | null;
  sitePhotoUrls: string[] | null;
  interiorPhotoUrls: string[] | null;
  equipmentPhotoUrls: string[] | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  suspendedAgents: number;
  pendingAgents: number;
  newAgentsLast30Days: number;
  totalInspections: number;
  inspectionsThisMonth: number;
  pendingTickets?: number;
  openTickets: number;
  lowStockItems: number;
  avgScore?: number;
  avgAgentScore: number;
  goldAgents: number;
  silverAgents: number;
  watchlistAgents: number;
  highRiskAgents: number;
  totalViolationsThisMonth: number;
  documents: {
    total: number;
    valid: number;
    expiringSoon: number;
    expired: number;
    suspended: number;
  };
}

export interface AgentDocStatus {
  agentId: number;
  hasExpired: boolean;
  hasExpiringSoon: boolean;
  hasSuspended: boolean;
  total: number;
}

export interface AgentRankingItem {
  agentId: number;
  agentName: string;
  score: number;
  classification: string;
}

export interface RiskDistributionItem {
  classification: string;
  count: number;
}

export interface SalesComparisonItem {
  agentId: number;
  agentName: string;
  fieldSales: number;
  reportedSales: number;
  complianceFlag: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  department?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

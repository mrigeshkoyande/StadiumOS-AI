export type IncidentType = 'medical' | 'security' | 'maintenance' | 'crowd';

export interface Incident {
  id: string;
  type: IncidentType;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'active' | 'resolved';
  assignedTeam: string;
  summary: string;
  recommendedAction: string;
}

export interface GateStatus {
  id: string;
  name: string;
  queueLength: number; // in persons
  estimatedWaitTime: number; // in minutes
  density: 'low' | 'medium' | 'high' | 'critical';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface TransportStatus {
  id: string;
  type: 'metro' | 'shuttle' | 'bus';
  name: string;
  status: 'normal' | 'congested' | 'delayed';
  estimatedWaitTime: number;
}

export interface AIResponse {
  answer: string;
  intent: 'navigation' | 'ticket' | 'operations' | 'incident' | 'transport' | 'accessibility' | 'general';
  confidence: number;
  dataSources: string[];
  verified: boolean;
  requiresAction: boolean;
  recommendedActions: Record<string, unknown>[];
  missingData: string[];
}

/** 3D position in the stadium scene [x, y, z] */
export type GatePosition = [number, number, number];

/** Map of gate IDs to their 3D world positions */
export interface GatePositionMap {
  [gateId: string]: GatePosition;
}

/** Full mutable stadium state used by the simulation hook */
export interface StadiumState {
  gates: GateStatus[];
  incidents: Incident[];
  transport: TransportStatus[];
  isSimulating: boolean;
  simulationStep: number;
  redirectionActive: boolean;
}

export interface User {
  id: number;
  username: string;
  role: string;
  name: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  match_id: string;
  seat: string;
  gate: string;
  status: string;
  qr_token: string;
}

export interface Log {
  id: number;
  user_id: number;
  username?: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Config {
  [key: string]: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  read_state: number;
  timestamp: string;
}

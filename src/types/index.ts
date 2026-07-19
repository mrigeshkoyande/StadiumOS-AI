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
  type: 'route_recommendation' | 'crowd_analysis' | 'incident_analysis' | 'transport_recommendation' | 'accessibility_guidance' | 'multilingual_translation' | 'sustainability_insight' | 'operational_recommendation';
  summary: string;
  recommendation: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actions: string[];
  supportingData: any[];
  timestamp: string;
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

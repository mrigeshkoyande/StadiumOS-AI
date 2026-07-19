import type { Incident, GateStatus, TransportStatus } from '../types';

export const mockIncidents: Incident[] = [
  {
    id: 'INC-001',
    type: 'medical',
    location: 'Section 118',
    severity: 'high',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    status: 'active',
    assignedTeam: 'Medical Response Team Alpha',
    summary: 'Medical assistance requested near Section 118.',
    recommendedAction: 'Dispatch nearest medical team. ETA: 2 mins.'
  },
  {
    id: 'INC-002',
    type: 'crowd',
    location: 'Gate B',
    severity: 'medium',
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    status: 'active',
    assignedTeam: 'Operations Team 2',
    summary: 'Gate B crowd density increasing rapidly.',
    recommendedAction: 'Redirect fans to Gate C and deploy 3 volunteers.'
  }
];

export const mockGateStatus: GateStatus[] = [
  { id: 'gate-a', name: 'Gate A', queueLength: 120, estimatedWaitTime: 5, density: 'low', trend: 'stable' },
  { id: 'gate-b', name: 'Gate B', queueLength: 450, estimatedWaitTime: 18, density: 'high', trend: 'increasing' },
  { id: 'gate-c', name: 'Gate C', queueLength: 85, estimatedWaitTime: 3, density: 'low', trend: 'decreasing' },
];

export const mockTransportStatus: TransportStatus[] = [
  { id: 'trans-1', type: 'metro', name: 'Metro Line 2', status: 'congested', estimatedWaitTime: 12 },
  { id: 'trans-2', type: 'shuttle', name: 'Shuttle Hub B', status: 'normal', estimatedWaitTime: 4 },
  { id: 'trans-3', type: 'bus', name: 'Bus Route 42', status: 'delayed', estimatedWaitTime: 25 }
];

// Tools that the AI can call
export const tools = {
  getCrowdDensity: () => JSON.stringify(mockGateStatus),
  getGateQueueStatus: (gateId?: string) => {
    if (gateId) return JSON.stringify(mockGateStatus.find(g => g.id === gateId));
    return JSON.stringify(mockGateStatus);
  },
  getUserLocation: () => JSON.stringify({ current: 'Gate A', destination: 'Section 214' }),
  getTransportStatus: () => JSON.stringify(mockTransportStatus),
  getActiveIncidents: () => JSON.stringify(mockIncidents.filter(i => i.status === 'active')),
  getAccessibilityRoutes: () => JSON.stringify({ 
    recommendation: 'Use East Concourse elevators near Gate C for step-free access.' 
  }),
};

/** 3D positions for each gate in the stadium scene */
export const GATE_3D_POSITIONS: Record<string, [number, number, number]> = {
  'gate-a': [0, 0.5, -5.5],    // North
  'gate-b': [5.5, 0.5, 0],     // East
  'gate-c': [0, 0.5, 5.5],     // South
  'gate-d': [-5.5, 0.5, 0],    // West
};

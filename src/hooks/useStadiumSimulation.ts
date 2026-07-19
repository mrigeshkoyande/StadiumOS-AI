import { useState, useCallback, useRef } from 'react';
import type { GateStatus, Incident, StadiumState } from '../types';
import { mockGateStatus, mockIncidents } from '../services/mockData';

const INITIAL_STATE: StadiumState = {
  gates: mockGateStatus.map(g => ({ ...g })),
  incidents: mockIncidents.map(i => ({ ...i })),
  transport: [],
  isSimulating: false,
  simulationStep: 0,
  redirectionActive: false,
};

/**
 * Hook that manages mutable stadium state and drives the 10-step demo simulation.
 * Each step fires on a timer to create a visible real-time progression.
 */
export function useStadiumSimulation() {
  const [state, setState] = useState<StadiumState>({ ...INITIAL_STATE, gates: mockGateStatus.map(g => ({ ...g })), incidents: mockIncidents.map(i => ({ ...i })) });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [focusGateId, setFocusGateId] = useState<string | null>(null);

  const updateGate = useCallback((gateId: string, patch: Partial<GateStatus>) => {
    setState(prev => ({
      ...prev,
      gates: prev.gates.map(g => g.id === gateId ? { ...g, ...patch } : g),
    }));
  }, []);

  const addIncident = useCallback((incident: Incident) => {
    setState(prev => ({
      ...prev,
      incidents: [...prev.incidents, incident],
    }));
  }, []);

  const acceptRedirection = useCallback(() => {
    setState(prev => ({ ...prev, redirectionActive: true }));
    // Gate B eases, Gate C increases slightly
    updateGate('gate-b', { queueLength: 280, estimatedWaitTime: 10, density: 'medium', trend: 'decreasing' });
    updateGate('gate-c', { queueLength: 140, estimatedWaitTime: 5, density: 'low', trend: 'increasing' });
  }, [updateGate]);

  const startSimulation = useCallback(() => {
    // Clear any previous timers
    timers.current.forEach(clearTimeout);
    timers.current = [];

    // Reset to initial state
    setState({
      gates: mockGateStatus.map(g => ({ ...g })),
      incidents: mockIncidents.map(i => ({ ...i })),
      transport: [],
      isSimulating: true,
      simulationStep: 1,
      redirectionActive: false,
    });
    setFocusGateId(null);

    // Step 2: Gate B starts increasing (2s)
    timers.current.push(setTimeout(() => {
      updateGate('gate-b', { queueLength: 300, estimatedWaitTime: 12, density: 'medium', trend: 'increasing' });
      setState(prev => ({ ...prev, simulationStep: 2 }));
    }, 2000));

    // Step 3: Gate B continues to rise (5s)
    timers.current.push(setTimeout(() => {
      updateGate('gate-b', { queueLength: 450, estimatedWaitTime: 18, density: 'high', trend: 'increasing' });
      setState(prev => ({ ...prev, simulationStep: 3 }));
    }, 5000));

    // Step 4: Focus camera on Gate B (7s)
    timers.current.push(setTimeout(() => {
      setFocusGateId('gate-b');
      setState(prev => ({ ...prev, simulationStep: 4 }));
    }, 7000));

    // Step 5: AI detects — add crowd incident (9s)
    timers.current.push(setTimeout(() => {
      addIncident({
        id: 'INC-SIM-001',
        type: 'crowd',
        location: 'Gate B',
        severity: 'high',
        timestamp: new Date().toISOString(),
        status: 'active',
        assignedTeam: 'Crowd Management Unit',
        summary: 'AI DETECTED: Gate B density increasing 18% faster than normal. Congestion predicted within 12 minutes.',
        recommendedAction: 'Redirect incoming fans to Gate C and deploy 3 volunteers.',
      });
      setState(prev => ({ ...prev, simulationStep: 5 }));
    }, 9000));

    // Step 6: Simulation ready for user action (12s)
    timers.current.push(setTimeout(() => {
      setState(prev => ({ ...prev, simulationStep: 6, isSimulating: false }));
    }, 12000));
  }, [updateGate, addIncident]);

  const stopSimulation = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setState(prev => ({ ...prev, isSimulating: false }));
  }, []);

  return {
    state,
    focusGateId,
    setFocusGateId,
    startSimulation,
    stopSimulation,
    acceptRedirection,
  };
}

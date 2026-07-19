import { describe, it, expect } from 'vitest';
import { askAI } from '../services/ai';
import { tools } from '../services/mockData';

describe('AI Service', () => {
  it('returns a fallback response when API key is missing', async () => {
    // In test env, import.meta.env.VITE_GEMINI_API_KEY is undefined
    const response = await askAI('Is gate B congested?', 'ops');
    
    expect(response).toBeDefined();
    expect(response.intent).toBe('operations');
    expect(response.verified).toBe(true);
    expect(response.answer).toContain('Gate B crowd density is increasing rapidly');
  });

  it('mock data tool returns valid JSON', () => {
    const queueData = tools.getGateQueueStatus('gate-a');
    expect(JSON.parse(queueData)).toHaveProperty('id', 'gate-a');
  });
});

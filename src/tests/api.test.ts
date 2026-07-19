import { describe, it, expect } from 'vitest';
import { tools as stadiumTools } from '../services/mockData';

describe('StadiumOS API Tools', () => {
  it('getCrowdDensity returns an array of gate statuses', () => {
    const stateStr = stadiumTools.getCrowdDensity();
    const state = JSON.parse(stateStr);
    expect(state).toBeInstanceOf(Array);
    expect(state[0]).toHaveProperty('id');
    expect(state[0]).toHaveProperty('density');
  });

});

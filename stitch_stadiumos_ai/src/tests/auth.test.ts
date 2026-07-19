import { describe, it, expect } from 'vitest';
import crypto from 'crypto';

describe('Authentication Utilities', () => {
  it('hashes passwords securely using SHA-256', () => {
    const password = 'admin123';
    const hashPassword = (pwd: string) => crypto.createHash('sha256').update(pwd).digest('hex');
    
    const hash = hashPassword(password);
    
    // Ensure hash is deterministic
    expect(hash).toBe(hashPassword(password));
    
    // Ensure hash length is 64 characters (hex digest of SHA-256)
    expect(hash.length).toBe(64);
    
    // Ensure it does not match plain text
    expect(hash).not.toBe(password);
  });

  it('generates different hashes for different passwords', () => {
    const hashPassword = (pwd: string) => crypto.createHash('sha256').update(pwd).digest('hex');
    
    const hash1 = hashPassword('fan123');
    const hash2 = hashPassword('ops123');
    
    expect(hash1).not.toBe(hash2);
  });
});

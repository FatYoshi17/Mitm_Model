import type { TLSInput } from './api';

// Default TLS input for testing/demo purposes
export const defaultTLSInput: TLSInput = {
  handshake_time_ms: 45,
  ja4_client_stability: 0.85,
  ja4_server_stability: 0.90,
  cert_reuse_score: 0.3,
  ca_rarity_score: 0.2,
};

// Example suspicious input (MITM-like)
export const suspiciousTLSInput: TLSInput = {
  handshake_time_ms: 247,
  ja4_client_stability: 0.4,
  ja4_server_stability: 0.35,
  cert_reuse_score: 0.85,
  ca_rarity_score: 0.8,
};

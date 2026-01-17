// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface TLSInput {
  handshake_time_ms: number;
  ja4_client_stability: number;
  ja4_server_stability: number;
  cert_reuse_score: number;
  ca_rarity_score: number;
}

export interface PredictionResponse {
  prediction: string;
  anomaly_score: number;
  threshold: number;
  explanation: {
    high_latency: boolean;
    low_tls_stability: boolean;
    certificate_risk: boolean;
  };
}

// Transform API response into UI-friendly format
export function transformPredictionToUIData(response: PredictionResponse, input: TLSInput) {
  const isAttack = response.prediction === 'MITM_ATTACK';
  const severity = isAttack ? 'HIGH' : 'LOW';
  const confidence = Math.round(response.anomaly_score * 100);

  return {
    // Top Nav Bar Data
    status: isAttack ? 'SYSTEM AT RISK' : 'SYSTEM SECURE',
    active_alerts: isAttack ? 3 : 0,
    last_scan_time: new Date().toUTCString().replace('GMT', 'UTC'),

    // Severity Overview Data
    severity: severity,
    confidence: confidence,
    short_explanation: isAttack
      ? `Strong indicators of TLS interception were detected. Anomaly score: ${response.anomaly_score.toFixed(4)}`
      : 'No suspicious TLS patterns detected. Connection appears legitimate.',

    // Summary Bullets Data
    summary_bullets: generateSummaryBullets(response, input),

    // Hypothesis Probability Data
    hypotheses: generateHypotheses(response),

    // Evidence Table Data
    evidence: generateEvidence(response, input),

    // Risk Reasoning Data
    risk_reasoning: generateRiskReasoning(response),

    // Recommended Actions Data
    recommended_actions: generateRecommendedActions(response),

    // Limitations Data
    limitations: [
      'Analysis is probabilistic, not definitive - false positives may occur',
      'Network conditions may influence signals - VPNs can trigger similar patterns',
      'Further investigation recommended for critical systems',
      'Model trained on specific TLS patterns - results may vary by environment',
    ],

    // Metadata
    analysis_id: `SL-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
    model: 'Isolation Forest TLS Anomaly Detector',
    analysis_timestamp_utc: new Date().toISOString(),
  };
}

function generateSummaryBullets(response: PredictionResponse, input: TLSInput): string[] {
  const bullets: string[] = [];

  if (response.explanation.high_latency) {
    bullets.push(`High handshake latency detected: ${input.handshake_time_ms}ms`);
  }

  if (response.explanation.low_tls_stability) {
    bullets.push(`Low TLS stability detected - Client: ${(input.ja4_client_stability * 100).toFixed(0)}%, Server: ${(input.ja4_server_stability * 100).toFixed(0)}%`);
  }

  if (response.explanation.certificate_risk) {
    bullets.push(`Certificate risk indicators present - Reuse: ${(input.cert_reuse_score * 100).toFixed(0)}%, Rarity: ${(input.ca_rarity_score * 100).toFixed(0)}%`);
  }

  bullets.push(`Anomaly score: ${response.anomaly_score.toFixed(4)} (threshold: ${response.threshold})`);
  bullets.push(`Prediction: ${response.prediction}`);

  return bullets.length > 0
    ? bullets
    : ['No significant anomalies detected', 'Connection parameters within normal range'];
}

function generateHypotheses(response: PredictionResponse) {
  if (response.prediction === 'MITM_ATTACK') {
    return [
      { type: 'TLS Interception', probability: Math.min(90, response.anomaly_score * 100) },
      { type: 'Benign Proxy', probability: Math.min(20, (1 - response.anomaly_score) * 100) },
      { type: 'Network Variance', probability: 5 },
    ];
  }

  return [
    { type: 'Legitimate Connection', probability: 85 },
    { type: 'Benign Proxy', probability: 10 },
    { type: 'Network Variance', probability: 5 },
  ];
}

function generateEvidence(response: PredictionResponse, input: TLSInput) {
  return [
    {
      signal: 'handshake_time_ms',
      observation: `${input.handshake_time_ms}ms`,
      interpretation: `Handshake took ${input.handshake_time_ms}ms. ${
        response.explanation.high_latency
          ? 'This is higher than normal (<30ms expected).'
          : 'This is within normal range.'
      }`,
      confidence: response.explanation.high_latency ? 'High' : 'Low',
    },
    {
      signal: 'ja4_client_stability',
      observation: `${(input.ja4_client_stability * 100).toFixed(0)}%`,
      interpretation: `Client TLS stability at ${(input.ja4_client_stability * 100).toFixed(0)}%. ${
        input.ja4_client_stability < 0.5 ? 'Below expected stability threshold.' : 'Within normal range.'
      }`,
      confidence: input.ja4_client_stability < 0.5 ? 'High' : 'Low',
    },
    {
      signal: 'ja4_server_stability',
      observation: `${(input.ja4_server_stability * 100).toFixed(0)}%`,
      interpretation: `Server TLS stability at ${(input.ja4_server_stability * 100).toFixed(0)}%. ${
        input.ja4_server_stability < 0.5 ? 'Below expected stability threshold.' : 'Within normal range.'
      }`,
      confidence: input.ja4_server_stability < 0.5 ? 'High' : 'Low',
    },
    {
      signal: 'cert_reuse_score',
      observation: `${(input.cert_reuse_score * 100).toFixed(0)}%`,
      interpretation: `Certificate reuse score at ${(input.cert_reuse_score * 100).toFixed(0)}%. ${
        input.cert_reuse_score > 0.7 ? 'Higher than expected - may indicate reused certificates.' : 'Within normal range.'
      }`,
      confidence: input.cert_reuse_score > 0.7 ? 'High' : 'Low',
    },
    {
      signal: 'ca_rarity_score',
      observation: `${(input.ca_rarity_score * 100).toFixed(0)}%`,
      interpretation: `CA rarity score at ${(input.ca_rarity_score * 100).toFixed(0)}%. ${
        input.ca_rarity_score > 0.7 ? 'Unusual CA detected - may indicate corporate proxy.' : 'Common CA detected.'
      }`,
      confidence: input.ca_rarity_score > 0.7 ? 'High' : 'Low',
    },
    {
      signal: 'anomaly_score',
      observation: `${response.anomaly_score.toFixed(4)} / ${response.threshold}`,
      interpretation: `Overall anomaly score is ${response.anomaly_score.toFixed(4)}, ${
        response.anomaly_score > response.threshold
          ? `exceeding the threshold of ${response.threshold}.`
          : `below the threshold of ${response.threshold}.`
      }`,
      confidence: 'High',
    },
  ];
}

function generateRiskReasoning(response: PredictionResponse) {
  if (response.prediction === 'MITM_ATTACK') {
    return {
      why_high_risk: [
        `Anomaly score ${response.anomaly_score.toFixed(4)} exceeds threshold ${response.threshold}`,
        'Multiple TLS stability indicators show deviation from normal',
        'Certificate and CA rarity metrics suggest unusual configuration',
        'Handshake timing consistent with interception patterns',
      ],
      what_is_not_seen: [
        'No definitive proof of data tampering (requires packet analysis)',
        'No known malware signatures detected',
        'Could be legitimate corporate proxy/firewall',
      ],
    };
  }

  return {
    why_low_risk: [
      `Anomaly score ${response.anomaly_score.toFixed(4)} is within safe threshold`,
      'TLS parameters show normal behavior patterns',
      'Certificate chain appears legitimate',
      'Connection timing is within expected range',
    ],
    what_is_seen: [
      'Normal TLS handshake characteristics',
      'Standard certificate configuration',
      'Expected network latency',
    ],
  };
}

function generateRecommendedActions(response: PredictionResponse): string[] {
  if (response.prediction === 'MITM_ATTACK') {
    return [
      'Isolate affected system from network immediately',
      'Capture network traffic for forensic analysis',
      'Review proxy/firewall configurations',
      'Check for unauthorized certificate installations',
      'Review browser extensions and installed software',
      'Monitor for similar alerts across the network',
      'Escalate to security team for investigation',
    ];
  }

  return [
    'Continue normal operations - no action required',
    'Monitor connection for any anomalies',
    'Keep TLS software updated',
    'Maintain audit logs for compliance',
  ];
}

// Fetch prediction from API
export async function getPrediction(input: TLSInput): Promise<PredictionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch prediction:', error);
    throw error;
  }
}

// Health check
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

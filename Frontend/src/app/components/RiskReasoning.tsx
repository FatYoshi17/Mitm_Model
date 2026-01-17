import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface RiskReasoningProps {
  risk_reasoning: {
    why_high_risk?: string[];
    what_is_not_seen?: string[];
    why_low_risk?: string[];
    what_is_seen?: string[];
  };
}

export function RiskReasoning({ risk_reasoning }: RiskReasoningProps) {
  // Determine if this is high-risk or low-risk scenario
  const isHighRisk = !!(risk_reasoning.why_high_risk && risk_reasoning.why_high_risk.length > 0);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Risk Assessment */}
      {isHighRisk ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-red-300">Why This Is High Risk</h3>
              <p className="text-xs text-gray-400 mt-1">Primary threat indicators detected</p>
            </div>
          </div>
          
          <ul className="space-y-3">
            {risk_reasoning.why_high_risk?.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-red-400 mt-1 flex-shrink-0 font-bold">•</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-green-300">Why This Is Low Risk</h3>
              <p className="text-xs text-gray-400 mt-1">Normal behavior patterns detected</p>
            </div>
          </div>
          
          <ul className="space-y-3">
            {risk_reasoning.why_low_risk?.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-green-400 mt-1 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Right Column - Observations */}
      {isHighRisk ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-green-300">What Is Not Seen</h3>
              <p className="text-xs text-gray-400 mt-1">Absent malicious indicators</p>
            </div>
          </div>
          
          <ul className="space-y-3">
            {risk_reasoning.what_is_not_seen?.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-green-400 mt-1 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-blue-300">What Is Seen</h3>
              <p className="text-xs text-gray-400 mt-1">Positive indicators detected</p>
            </div>
          </div>
          
          <ul className="space-y-3">
            {risk_reasoning.what_is_seen?.map((reason, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-gray-300">
                <span className="text-blue-400 mt-1 flex-shrink-0 font-bold">✓</span>
                <span className="leading-relaxed">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

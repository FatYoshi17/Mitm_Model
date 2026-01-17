import { Hash, Cpu, Clock } from 'lucide-react';

interface MetadataFooterProps {
  analysis_id: string;
  model: string;
  analysis_timestamp_utc: string;
}

export function MetadataFooter({ analysis_id, model, analysis_timestamp_utc }: MetadataFooterProps) {
  // Format timestamp if it's an ISO string
  const formatTimestamp = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC'
      }) + ' UTC';
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
      <div className="grid grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <Hash className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Analysis ID</div>
            <div className="font-mono text-sm text-white break-all">{analysis_id || 'N/A'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Cpu className="w-5 h-5 text-purple-400 mt-0.5" />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Model</div>
            <div className="font-mono text-sm text-white">{model || 'Unknown Model'}</div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Timestamp (UTC)</div>
            <div className="font-mono text-sm text-white">{formatTimestamp(analysis_timestamp_utc)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

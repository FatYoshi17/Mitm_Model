import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

interface RecommendedActionsProps {
  recommended_actions: string[];
}

export function RecommendedActions({ recommended_actions }: RecommendedActionsProps) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  // Handle empty state
  const actions = recommended_actions && recommended_actions.length > 0 
    ? recommended_actions 
    : ['Continue normal monitoring', 'Keep systems updated'];

  // Determine if these are critical actions or preventive
  const isCritical = actions.some(a => 
    a.toLowerCase().includes('isolate') || 
    a.toLowerCase().includes('immediate') ||
    a.toLowerCase().includes('escalate')
  );

  const borderColor = isCritical ? 'border-red-500/30' : 'border-blue-500/30';
  const bgColor = isCritical ? 'bg-red-500/5' : 'bg-blue-500/5';
  const titleColor = isCritical ? 'text-red-300' : 'text-blue-300';
  const iconColor = isCritical ? 'text-red-400' : 'text-blue-400';
  const hoverColor = isCritical ? 'hover:bg-red-500/10' : 'hover:bg-blue-500/10';

  return (
    <div className={`rounded-2xl border ${borderColor} ${bgColor} backdrop-blur-xl p-6 shadow-xl`}>
      <div className="mb-6">
        <h3 className={`text-base font-semibold ${titleColor}`}>
          {isCritical ? 'Critical Actions Required' : 'Recommended Actions'}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {isCritical 
            ? 'Urgent steps to mitigate identified threats' 
            : 'Suggested steps to maintain security'}
        </p>
      </div>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={index}
            onClick={() => handleCheck(index)}
            className={`flex items-start gap-3 p-4 rounded-lg bg-white/5 ${hoverColor} border border-white/10 cursor-pointer transition-all group`}
          >
            {checkedItems.has(index) ? (
              <CheckCircle2 className={`w-5 h-5 ${iconColor} mt-0.5 flex-shrink-0`} />
            ) : (
              <Circle className={`w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0 group-hover:${iconColor} transition-colors`} />
            )}
            <span className={`text-sm leading-relaxed transition-all ${
              checkedItems.has(index) ? 'text-gray-500 line-through' : 'text-gray-300'
            }`}>
              {action}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            Completed: {checkedItems.size} / {actions.length}
          </span>
          {checkedItems.size > 0 && (
            <button
              onClick={() => setCheckedItems(new Set())}
              className={`${iconColor} hover:opacity-80 transition-opacity`}
            >
              Reset All
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

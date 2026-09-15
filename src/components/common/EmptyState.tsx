import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-background-white rounded-2xl border border-border-light shadow-sm my-4 font-mono">
      <div className="p-3.5 bg-background-light text-text-l7 rounded-2xl mb-4 border border-border-light">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-text-l2">{title}</h4>
      <p className="text-sm text-text-l5 max-w-sm mt-1 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-background-white bg-semantic-green rounded-xl hover:bg-semanticDark-green shadow-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

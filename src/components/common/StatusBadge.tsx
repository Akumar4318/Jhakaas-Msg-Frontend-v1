import React from 'react';
import { MessageStatus } from '../../types';
import { getStatusConfig } from '../../utils/status.util';
import clsx from 'clsx';

interface StatusBadgeProps {
  status?: MessageStatus;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const config = getStatusConfig(status);

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-bold rounded-full border transition-colors font-mono',
        config.badgeClass,
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
      )}
      title={config.description}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full', config.dotClass)} />}
      {config.label}
    </span>
  );
};

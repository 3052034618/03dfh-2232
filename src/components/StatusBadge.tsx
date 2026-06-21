import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'warning' | 'success' | 'danger' | 'info';
  text: string;
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, pulse = false }) => {
  return (
    <span className={`status-badge status-badge-${status} ${pulse ? 'pulse-glow' : ''}`}>
      <span className="status-dot"></span>
      {text}
    </span>
  );
};

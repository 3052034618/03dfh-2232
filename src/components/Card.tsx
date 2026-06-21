import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerRight?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, className = '', headerRight }) => {
  return (
    <div className={`card ${className}`}>
      {(title || headerRight) && (
        <div className="card-header">
          <div className="card-header-left">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <span className="card-subtitle">{subtitle}</span>}
          </div>
          {headerRight && <div className="card-header-right">{headerRight}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

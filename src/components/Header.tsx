import React from 'react';
import { Thermometer, Truck, AlertTriangle, Clock, Settings, User } from 'lucide-react';
import { formatDateTime } from '../utils/format';

interface HeaderProps {
  currentTime: Date;
  onlineCount: number;
  totalCount: number;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTime, onlineCount, totalCount, alertCount }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">
            <Truck size={24} />
          </div>
          <div className="logo-text">
            <h1>冷链门磁告警系统</h1>
            <span>Cold Chain Door Magnet Alarm</span>
          </div>
        </div>
      </div>

      <div className="header-center">
        <div className="header-metrics">
          <div className="header-metric">
            <div className="metric-icon online">
              <Truck size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-value mono-text">{onlineCount}/{totalCount}</span>
              <span className="metric-label">在线车辆</span>
            </div>
          </div>

          <div className="header-metric">
            <div className="metric-icon warning">
              <AlertTriangle size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-value mono-text warning-text">{alertCount}</span>
              <span className="metric-label">异常告警</span>
            </div>
          </div>

          <div className="header-metric">
            <div className="metric-icon temp">
              <Thermometer size={16} />
            </div>
            <div className="metric-content">
              <span className="metric-value mono-text">-18.5°C</span>
              <span className="metric-label">平均温度</span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="datetime-display">
          <Clock size={16} className="clock-icon" />
          <span className="date-time mono-text">{formatDateTime(currentTime.toISOString())}</span>
        </div>
        <div className="user-info">
          <div className="user-avatar">
            <User size={18} />
          </div>
          <span className="user-name">管理员</span>
        </div>
        <button className="icon-btn">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

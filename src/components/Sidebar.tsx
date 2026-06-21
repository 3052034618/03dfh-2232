import React from 'react';
import { ClipboardCheck, ShieldCheck, RotateCcw } from 'lucide-react';
import type { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'inspection' as TabType, label: '车辆检查', subLabel: '发车校验', icon: ClipboardCheck },
    { id: 'seal' as TabType, label: '封车记录', subLabel: '封车留痕', icon: ShieldCheck },
    { id: 'return' as TabType, label: '返场核对', subLabel: '异常处理', icon: RotateCcw },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <div className="sidebar-item-icon">
                <Icon size={20} />
              </div>
              <div className="sidebar-item-text">
                <span className="sidebar-item-label">{item.label}</span>
                <span className="sidebar-item-sub">{item.subLabel}</span>
              </div>
              {isActive && <div className="sidebar-item-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-panel">
          <div className="status-panel-title">系统状态</div>
          <div className="status-panel-item">
            <span className="status-dot status-online"></span>
            <span>门磁服务正常</span>
          </div>
          <div className="status-panel-item">
            <span className="status-dot status-online"></span>
            <span>数据同步中</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

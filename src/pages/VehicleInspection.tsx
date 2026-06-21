import React, { useState } from 'react';
import { Search, RefreshCw, AlertTriangle, CheckCircle, DoorOpen, DoorClosed, Battery, Signal, Thermometer, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockVehicles, mockDoorMagnetStatuses, mockLoadingRecords } from '../data/mockData';
import { formatDateTime, formatTimeAgo, isTimeInRange } from '../utils/format';
import type { DoorMagnetStatus, LoadingRecord } from '../types';

interface VehicleInspectionProps {
  onSealVehicle: (vehicleId: string) => void;
}

export const VehicleInspection: React.FC<VehicleInspectionProps> = ({ onSealVehicle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [doorStatuses, setDoorStatuses] = useState<DoorMagnetStatus[]>(mockDoorMagnetStatuses);
  const [confirming, setConfirming] = useState(false);

  const filteredVehicles = mockVehicles.filter(v =>
    v.plateNumber.includes(searchTerm) ||
    v.driverName.includes(searchTerm)
  );

  const selectedVehicle = mockVehicles.find(v => v.id === selectedVehicleId) || null;
  const selectedDoorStatus = doorStatuses.find(d => d.vehicleId === selectedVehicleId) || null;
  const selectedLoadingRecord = mockLoadingRecords.find(l => l.vehicleId === selectedVehicleId && l.status !== 'cancelled') || null;

  const handleRefresh = () => {
    setDoorStatuses(prev => prev.map(s => ({
      ...s,
      lastUpdateTime: new Date().toISOString()
    })));
  };

  const handleConfirmClose = () => {
    if (!selectedVehicleId) return;
    setConfirming(true);
    setTimeout(() => {
      setDoorStatuses(prev => prev.map(s =>
        s.vehicleId === selectedVehicleId
          ? { ...s, isDoorClosed: true, lastCloseTime: new Date().toISOString(), lastUpdateTime: new Date().toISOString() }
          : s
      ));
      setConfirming(false);
    }, 2000);
  };

  const isDoorOpenDuringLoading = (doorStatus: DoorMagnetStatus | null, loadingRecord: LoadingRecord | null) => {
    if (!doorStatus || !loadingRecord || !doorStatus.lastOpenTime) return false;
    return isTimeInRange(doorStatus.lastOpenTime, loadingRecord.loadingStartTime, loadingRecord.loadingEndTime);
  };

  const canSeal = (doorStatus: DoorMagnetStatus | null) => {
    if (!doorStatus) return false;
    return doorStatus.isOnline && doorStatus.isDoorClosed;
  };

  return (
    <div className="inspection-page">
      <div className="inspection-left">
        <Card
          title="待检车辆列表"
          subtitle={`共 ${filteredVehicles.length} 辆`}
          headerRight={
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={handleRefresh}>
              刷新
            </Button>
          }
        >
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="搜索车牌号或司机姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="vehicle-list">
            {filteredVehicles.map(vehicle => {
              const doorStatus = doorStatuses.find(d => d.vehicleId === vehicle.id);
              const loadingRecord = mockLoadingRecords.find(l => l.vehicleId === vehicle.id && l.status !== 'cancelled');
              const isSelected = selectedVehicleId === vehicle.id;
              const hasAlert = doorStatus && (!doorStatus.isOnline || !doorStatus.isDoorClosed);

              return (
                <div
                  key={vehicle.id}
                  className={`vehicle-item ${isSelected ? 'selected' : ''} ${hasAlert ? 'has-alert' : ''}`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <div className="vehicle-item-header">
                    <span className="vehicle-plate mono-text">{vehicle.plateNumber}</span>
                    {doorStatus && (
                      <StatusBadge
                        status={doorStatus.isOnline ? (doorStatus.isDoorClosed ? 'success' : 'warning') : 'offline'}
                        text={doorStatus.isOnline ? (doorStatus.isDoorClosed ? '门已关' : '门未关') : '离线'}
                        pulse={!doorStatus.isDoorClosed}
                      />
                    )}
                  </div>
                  <div className="vehicle-info">
                    <span>{vehicle.vehicleType}</span>
                    <span>司机：{vehicle.driverName}</span>
                    {loadingRecord && <span>月台：{loadingRecord.dockNumber}</span>}
                  </div>
                  {hasAlert && !doorStatus?.isDoorClosed && (
                    <div className="vehicle-alert">
                      <AlertTriangle size={12} />
                      <span>车门未关闭，请检查</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="inspection-right">
        {selectedVehicle && selectedDoorStatus ? (
          <>
            <div className="inspection-header">
              <div className="inspection-vehicle-info">
                <h2 className="vehicle-plate-large mono-text">{selectedVehicle.plateNumber}</h2>
                <div className="vehicle-tags">
                  <span className="vehicle-tag">{selectedVehicle.vehicleType}</span>
                  <span className="vehicle-tag">
                    <Thermometer size={12} /> {selectedVehicle.temperature}°C
                  </span>
                </div>
              </div>
              <div className="inspection-status">
                <StatusBadge
                  status={selectedDoorStatus.isOnline ? (selectedDoorStatus.isDoorClosed ? 'success' : 'warning') : 'danger'}
                  text={selectedDoorStatus.isOnline ? (selectedDoorStatus.isDoorClosed ? '状态正常' : '门未关闭') : '设备离线'}
                  pulse={!selectedDoorStatus.isDoorClosed}
                />
              </div>
            </div>

            {selectedLoadingRecord && (
              <Card title="装货信息" className="mt-4">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">月台编号</span>
                    <span className="info-value">{selectedLoadingRecord.dockNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">货物类型</span>
                    <span className="info-value">{selectedLoadingRecord.goodsType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">货物重量</span>
                    <span className="info-value">{selectedLoadingRecord.weight} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">装货状态</span>
                    <span className="info-value">
                      {selectedLoadingRecord.status === 'loading' ? '装货中' : '装货完成'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">开始时间</span>
                    <span className="info-value mono-text">{formatDateTime(selectedLoadingRecord.loadingStartTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">结束时间</span>
                    <span className="info-value mono-text">
                      {selectedLoadingRecord.loadingEndTime ? formatDateTime(selectedLoadingRecord.loadingEndTime) : '进行中'}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Card title="门磁状态详情" className="mt-4">
              <div className="door-status-overview">
                <div className={`door-icon-wrapper ${selectedDoorStatus.isDoorClosed ? 'closed' : 'open'}`}>
                  {selectedDoorStatus.isDoorClosed ? (
                    <DoorClosed size={48} />
                  ) : (
                    <DoorOpen size={48} />
                  )}
                </div>
                <div className="door-status-text">
                  <h3>{selectedDoorStatus.isDoorClosed ? '车门已关闭' : '车门未关闭'}</h3>
                  <p>门磁设备：{selectedDoorStatus.id}</p>
                </div>
              </div>

              <div className="status-metrics">
                <div className="status-metric">
                  <div className="status-metric-icon online">
                    <Signal size={18} />
                  </div>
                  <div className="status-metric-info">
                    <span className="status-metric-label">在线状态</span>
                    <span className={`status-metric-value ${selectedDoorStatus.isOnline ? 'text-green' : 'text-red'}`}>
                      {selectedDoorStatus.isOnline ? '在线' : '离线'}
                    </span>
                  </div>
                  <div className="signal-bar">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`signal-bar-segment ${i < Math.ceil(selectedDoorStatus.signalStrength / 20) ? 'active' : ''}`}
                        style={{ height: `${(i + 1) * 4 + 4}px` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="status-metric">
                  <div className="status-metric-icon battery">
                    <Battery size={18} />
                  </div>
                  <div className="status-metric-info">
                    <span className="status-metric-label">电池电量</span>
                    <span className="status-metric-value mono-text">{selectedDoorStatus.batteryLevel}%</span>
                  </div>
                  <div className="battery-bar">
                    <div
                      className={`battery-fill ${selectedDoorStatus.batteryLevel > 30 ? 'battery-good' : selectedDoorStatus.batteryLevel > 15 ? 'battery-medium' : 'battery-low'}`}
                      style={{ width: `${selectedDoorStatus.batteryLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="timeline-section">
                <h4 className="section-subtitle">开关门记录</h4>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot open" />
                    <div className="timeline-content">
                      <div className="timeline-title">
                        <DoorOpen size={14} />
                        <span>最近开门</span>
                      </div>
                      <div className="timeline-time mono-text">
                        {selectedDoorStatus.lastOpenTime ? formatDateTime(selectedDoorStatus.lastOpenTime) : '--'}
                      </div>
                      {selectedDoorStatus.lastOpenTime && (
                        <div className="timeline-sub">{formatTimeAgo(selectedDoorStatus.lastOpenTime)}</div>
                      )}
                      {selectedDoorStatus.lastOpenTime && selectedLoadingRecord && (
                        <div className={`timeline-tag ${isDoorOpenDuringLoading(selectedDoorStatus, selectedLoadingRecord) ? 'tag-normal' : 'tag-warning'}`}>
                          {isDoorOpenDuringLoading(selectedDoorStatus, selectedLoadingRecord) ? (
                            <><CheckCircle size={12} /> 装货时段内开门</>
                          ) : (
                            <><AlertTriangle size={12} /> 非装货时段开门</>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-dot close" />
                    <div className="timeline-content">
                      <div className="timeline-title">
                        <DoorClosed size={14} />
                        <span>最近关门</span>
                      </div>
                      <div className="timeline-time mono-text">
                        {selectedDoorStatus.lastCloseTime ? formatDateTime(selectedDoorStatus.lastCloseTime) : '--'}
                      </div>
                      {selectedDoorStatus.lastCloseTime && (
                        <div className="timeline-sub">{formatTimeAgo(selectedDoorStatus.lastCloseTime)}</div>
                      )}
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-dot update" />
                    <div className="timeline-content">
                      <div className="timeline-title">
                        <Clock size={14} />
                        <span>最后更新</span>
                      </div>
                      <div className="timeline-time mono-text">{formatDateTime(selectedDoorStatus.lastUpdateTime)}</div>
                      <div className="timeline-sub">{formatTimeAgo(selectedDoorStatus.lastUpdateTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {!selectedDoorStatus.isDoorClosed && (
              <div className="alert-box alert-danger blink-critical">
                <div className="alert-title">
                  <AlertCircle size={18} />
                  车门未关闭告警
                </div>
                <div className="alert-message">
                  检测到车辆 {selectedVehicle.plateNumber} 车门未完全关闭，请前往检查并重新关闭车门。
                  车门未关闭将导致冷链温度异常，影响货物质量。
                </div>
              </div>
            )}

            {selectedDoorStatus.isOnline && !selectedDoorStatus.isDoorClosed && (
              <div className="action-buttons">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirmClose}
                  disabled={confirming}
                  icon={confirming ? <RefreshCw size={18} className="spin" /> : <CheckCircle size={18} />}
                >
                  {confirming ? '正在确认关门...' : '确认车门已关闭'}
                </Button>
              </div>
            )}

            {canSeal(selectedDoorStatus) && selectedVehicleId && (
              <div className="action-buttons">
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => onSealVehicle(selectedVehicleId)}
                  icon={<CheckCircle size={18} />}
                >
                  进入封车流程
                </Button>
              </div>
            )}

            {!selectedDoorStatus.isOnline && (
              <div className="alert-box alert-warning">
                <div className="alert-title">
                  <AlertTriangle size={18} />
                  门磁设备离线
                </div>
                <div className="alert-message">
                  门磁设备当前处于离线状态，请检查设备电源或联系技术人员检修。
                  离线期间无法监控车门状态，建议人工检查确认。
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <MapPin size={48} />
            </div>
            <div className="empty-state-text">请从左侧选择车辆进行检查</div>
          </div>
        )}
      </div>
    </div>
  );
};

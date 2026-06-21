import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Thermometer,
  MapPin,
  Clock,
  ShieldAlert,
  Wrench,
  FileText,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  MessageSquare,
  Flag,
  RefreshCw
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockVehicles, mockReturnRecords } from '../data/mockData';
import { formatDateTime, formatDuration, getSeverityColor, getSeverityLabel } from '../utils/format';
import { loadReturnRecords, saveReturnRecords } from '../utils/storage';
import type { ReturnRecord } from '../types';

const now = new Date();

const initialPendingRecords: ReturnRecord[] = [
  {
    id: 'rr-pending-001',
    vehicleId: 'v001',
    plateNumber: '沪A·88629',
    returnTime: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
    sealNumber: 'SL-2026-0621-003',
    sealIntact: true,
    doorAbnormalities: [
      {
        id: 'ab-p01',
        openTime: new Date(now.getTime() - 1000 * 60 * 180).toISOString(),
        closeTime: new Date(now.getTime() - 1000 * 60 * 175).toISOString(),
        duration: 300,
        location: 'G60高速服务区',
        temperatureChange: 1.8,
        severity: 'medium'
      }
    ],
    driverExplanation: '',
    needRepair: false,
    needReview: false,
    needQualityControl: false,
    handlerName: '',
    remarks: ''
  },
  {
    id: 'rr-pending-002',
    vehicleId: 'v006',
    plateNumber: '沪F·88192',
    returnTime: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
    sealNumber: 'SL-2026-0621-005',
    sealIntact: false,
    doorAbnormalities: [
      {
        id: 'ab-p02',
        openTime: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
        closeTime: new Date(now.getTime() - 1000 * 60 * 85).toISOString(),
        duration: 300,
        location: '途中',
        temperatureChange: 3.2,
        severity: 'high'
      },
      {
        id: 'ab-p03',
        openTime: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        closeTime: new Date(now.getTime() - 1000 * 60 * 58).toISOString(),
        duration: 120,
        location: '目的地配送点',
        temperatureChange: 1.0,
        severity: 'low'
      }
    ],
    driverExplanation: '',
    needRepair: false,
    needReview: false,
    needQualityControl: false,
    handlerName: '',
    remarks: ''
  },
  {
    id: 'rr-pending-003',
    vehicleId: 'v005',
    plateNumber: '沪E·50917',
    returnTime: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
    sealNumber: 'SL-2026-0621-002',
    sealIntact: true,
    doorAbnormalities: [],
    driverExplanation: '',
    needRepair: false,
    needReview: false,
    needQualityControl: false,
    handlerName: '',
    remarks: ''
  }
];

export const ReturnCheckPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [returnRecords, setReturnRecords] = useState<ReturnRecord[]>(() => {
    const saved = loadReturnRecords([]);
    if (saved.length > 0) return saved;
    return [...initialPendingRecords, ...mockReturnRecords];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAbnormalities, setExpandedAbnormalities] = useState<Set<string>>(new Set());

  const [driverExplanation, setDriverExplanation] = useState('');
  const [needRepair, setNeedRepair] = useState(false);
  const [needReview, setNeedReview] = useState(false);
  const [needQualityControl, setNeedQualityControl] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [handlerName, setHandlerName] = useState('');
  const [sealIntact, setSealIntact] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const pendingRecords = returnRecords.filter(r => !r.handlerName);
  const historyRecords = returnRecords.filter(r => !!r.handlerName);

  const selectedRecord = returnRecords.find(r => r.id === selectedRecordId) || null;
  const selectedVehicle = mockVehicles.find(v => v.id === selectedRecord?.vehicleId) || null;

  const filteredRecords = (activeTab === 'pending' ? pendingRecords : historyRecords).filter(r =>
    r.plateNumber.includes(searchTerm) ||
    r.sealNumber.includes(searchTerm)
  );

  useEffect(() => {
    saveReturnRecords(returnRecords);
  }, [returnRecords]);

  const toggleAbnormality = (id: string) => {
    setExpandedAbnormalities(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    const record = returnRecords.find(r => r.id === recordId);
    if (record) {
      setDriverExplanation(record.driverExplanation || '');
      setNeedRepair(record.needRepair);
      setNeedReview(record.needReview);
      setNeedQualityControl(record.needQualityControl);
      setRemarks(record.remarks || '');
      setHandlerName(record.handlerName || '');
      setSealIntact(record.sealIntact);
    }
  };

  const handleSubmit = () => {
    if (!selectedRecordId) return;

    setSubmitting(true);

    setTimeout(() => {
      setReturnRecords(prev => prev.map(r =>
        r.id === selectedRecordId
          ? {
              ...r,
              driverExplanation,
              needRepair,
              needReview,
              needQualityControl,
              remarks,
              handlerName: handlerName || '系统默认',
              sealIntact
            }
          : r
      ));
      setSubmitting(false);
      setSelectedRecordId(null);
      setDriverExplanation('');
      setNeedRepair(false);
      setNeedReview(false);
      setNeedQualityControl(false);
      setRemarks('');
      setHandlerName('');
      setSealIntact(true);
      setActiveTab('history');
    }, 1500);
  };

  return (
    <div className="return-page">
      <div className="return-tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <AlertTriangle size={16} />
          待核对
          <span className="tab-badge warning">{pendingRecords.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={16} />
          历史记录
          <span className="tab-badge">{historyRecords.length}</span>
        </button>
      </div>

      <div className="return-content">
        <div className="return-left">
          <Card
            title={activeTab === 'pending' ? '待核对车辆' : '历史记录'}
            subtitle={`共 ${filteredRecords.length} 条记录`}
            headerRight={
              <div className="search-box small">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="搜索车牌号或封签号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            }
          >
            <div className="return-record-list">
              {filteredRecords.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FileText size={48} />
                  </div>
                  <div className="empty-state-text">
                    {activeTab === 'pending' ? '暂无待核对记录' : '暂无历史记录'}
                  </div>
                </div>
              ) : (
                filteredRecords.map(record => {
                  const isSelected = selectedRecordId === record.id;
                  const hasHighSeverity = record.doorAbnormalities.some(a => a.severity === 'high');

                  return (
                    <div
                      key={record.id}
                      className={`return-record-item ${isSelected ? 'selected' : ''} ${hasHighSeverity ? 'high-severity' : ''}`}
                      onClick={() => handleSelectRecord(record.id)}
                    >
                      <div className="return-record-header">
                        <span className="return-plate mono-text">{record.plateNumber}</span>
                        {hasHighSeverity ? (
                          <StatusBadge status="danger" text="高风险" pulse />
                        ) : record.doorAbnormalities.length > 0 ? (
                          <StatusBadge status="warning" text={`${record.doorAbnormalities.length}次异常`} />
                        ) : (
                          <StatusBadge status="success" text="正常" />
                        )}
                      </div>
                      <div className="return-record-info">
                        <span className="return-info-item">
                          <ShieldAlert size={12} />
                          {record.sealNumber}
                        </span>
                        <span className="return-info-item">
                          <Clock size={12} />
                          {formatDateTime(record.returnTime)}
                        </span>
                      </div>
                      {(record.needRepair || record.needReview || record.needQualityControl) && (
                        <div className="return-record-tags">
                          {record.needRepair && (
                            <span className="tag tag-danger">
                              <Wrench size={10} /> 需维修
                            </span>
                          )}
                          {record.needReview && (
                            <span className="tag tag-warning">
                              <RotateCcw size={10} /> 需复盘
                            </span>
                          )}
                          {record.needQualityControl && (
                            <span className="tag tag-info">
                              <Flag size={10} /> 已上报
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div className="return-right">
          {selectedRecord && selectedVehicle ? (
            <>
              <div className="return-detail-header">
                <div className="return-vehicle-info">
                  <h2 className="return-plate-large mono-text">{selectedVehicle.plateNumber}</h2>
                  <div className="return-vehicle-meta">
                    <span>{selectedVehicle.vehicleType}</span>
                    <span>司机：{selectedVehicle.driverName}</span>
                  </div>
                </div>
                <div className="return-status">
                  <StatusBadge
                    status={selectedRecord.doorAbnormalities.some(a => a.severity === 'high') ? 'danger' : selectedRecord.doorAbnormalities.length > 0 ? 'warning' : 'success'}
                    text={selectedRecord.doorAbnormalities.length > 0 ? `${selectedRecord.doorAbnormalities.length}次异常开门` : '无异常'}
                  />
                </div>
              </div>

              <Card title="封签检查" className="mt-4">
                <div className="seal-check-info">
                  <div className="seal-check-item">
                    <span className="seal-check-label">封签号</span>
                    <span className="seal-check-value mono-text">{selectedRecord.sealNumber}</span>
                  </div>
                  <div className="seal-check-item">
                    <span className="seal-check-label">封签状态</span>
                    <span className={`seal-check-value ${sealIntact ? 'text-green' : 'text-red'}`}>
                      {sealIntact ? (
                        <><CheckCircle size={16} /> 完整</>
                      ) : (
                        <><XCircle size={16} /> 破损</>
                      )}
                    </span>
                  </div>
                  <div className="seal-check-item">
                    <span className="seal-check-label">返场时间</span>
                    <span className="seal-check-value mono-text">{formatDateTime(selectedRecord.returnTime)}</span>
                  </div>
                </div>

                {!selectedRecord.handlerName && (
                  <div className="seal-check-action">
                    <div className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id="sealIntact"
                        checked={sealIntact}
                        onChange={(e) => setSealIntact(e.target.checked)}
                      />
                      <label htmlFor="sealIntact" className="checkbox-label">
                        封签完好
                      </label>
                    </div>
                  </div>
                )}
              </Card>

              <Card
                title="途中门磁异常记录"
                subtitle={`共 ${selectedRecord.doorAbnormalities.length} 次异常`}
                className="mt-4"
              >
                <div className="abnormality-list">
                  {selectedRecord.doorAbnormalities.length === 0 ? (
                    <div className="empty-state small">
                      <CheckCircle size={32} className="text-green" />
                      <p>途中无异常开门记录</p>
                    </div>
                  ) : (
                    selectedRecord.doorAbnormalities.map((abnormality, index) => {
                      const isExpanded = expandedAbnormalities.has(abnormality.id);
                      return (
                        <div
                          key={abnormality.id}
                          className={`abnormality-item severity-${abnormality.severity}`}
                        >
                          <div
                            className="abnormality-header"
                            onClick={() => toggleAbnormality(abnormality.id)}
                          >
                            <div className="abnormality-left">
                              <div
                                className="abnormality-indicator"
                                style={{ backgroundColor: getSeverityColor(abnormality.severity) }}
                              />
                              <div className="abnormality-info">
                                <span className="abnormality-title">异常开门 #{index + 1}</span>
                                <span className="abnormality-time mono-text">
                                  {formatDateTime(abnormality.openTime)}
                                </span>
                              </div>
                            </div>
                            <div className="abnormality-right">
                              <StatusBadge
                                status={abnormality.severity === 'high' ? 'danger' : abnormality.severity === 'medium' ? 'warning' : 'success'}
                                text={getSeverityLabel(abnormality.severity) + '风险'}
                              />
                              {isExpanded ? (
                                <ChevronUp size={16} />
                              ) : (
                                <ChevronDown size={16} />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="abnormality-detail">
                              <div className="abnormality-detail-grid">
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <Clock size={14} /> 开门时间
                                  </span>
                                  <span className="detail-value mono-text">
                                    {formatDateTime(abnormality.openTime)}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <Clock size={14} /> 关门时间
                                  </span>
                                  <span className="detail-value mono-text">
                                    {abnormality.closeTime ? formatDateTime(abnormality.closeTime) : '未关门'}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <AlertCircle size={14} /> 持续时长
                                  </span>
                                  <span className="detail-value">{formatDuration(abnormality.duration)}</span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">
                                    <Thermometer size={14} /> 温度变化
                                  </span>
                                  <span className={`detail-value ${abnormality.temperatureChange > 2 ? 'text-red' : abnormality.temperatureChange > 1 ? 'text-yellow' : ''}`}>
                                    +{abnormality.temperatureChange}°C
                                  </span>
                                </div>
                                <div className="detail-item full-width">
                                  <span className="detail-label">
                                    <MapPin size={14} /> 发生地点
                                  </span>
                                  <span className="detail-value">{abnormality.location}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              {!selectedRecord.handlerName ? (
                <>
                  <Card title="司机说明" className="mt-4">
                    <div className="form-group">
                      <label className="form-label">
                        <MessageSquare size={14} /> 司机情况说明
                      </label>
                      <textarea
                        className="form-textarea"
                        placeholder="请记录司机对途中开门情况的说明..."
                        value={driverExplanation}
                        onChange={(e) => setDriverExplanation(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </Card>

                  <Card title="处理标记" className="mt-4">
                    <div className="handling-options">
                      <div className="handling-option">
                        <div className="checkbox-wrapper large">
                          <input
                            type="checkbox"
                            id="needRepair"
                            checked={needRepair}
                            onChange={(e) => setNeedRepair(e.target.checked)}
                          />
                          <label htmlFor="needRepair" className="checkbox-label">
                            <div className="checkbox-title">
                              <Wrench size={18} />
                              需要维修门磁
                            </div>
                            <div className="checkbox-desc">门磁设备存在故障，需安排维修</div>
                          </label>
                        </div>
                      </div>

                      <div className="handling-option">
                        <div className="checkbox-wrapper large">
                          <input
                            type="checkbox"
                            id="needReview"
                            checked={needReview}
                            onChange={(e) => setNeedReview(e.target.checked)}
                          />
                          <label htmlFor="needReview" className="checkbox-label">
                            <div className="checkbox-title">
                              <RotateCcw size={18} />
                              复盘装卸流程
                            </div>
                            <div className="checkbox-desc">装货过程存在疑问，需复盘检查</div>
                          </label>
                        </div>
                      </div>

                      <div className="handling-option">
                        <div className="checkbox-wrapper large">
                          <input
                            type="checkbox"
                            id="needQC"
                            checked={needQualityControl}
                            onChange={(e) => setNeedQualityControl(e.target.checked)}
                          />
                          <label htmlFor="needQC" className="checkbox-label">
                            <div className="checkbox-title">
                              <Flag size={18} />
                              上报质控部门
                            </div>
                            <div className="checkbox-desc">异常情况严重，需质控部门介入</div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group mt-4">
                      <label className="form-label">处理备注</label>
                      <textarea
                        className="form-textarea"
                        placeholder="请输入处理备注信息..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <User size={14} /> 处理人
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="请输入处理人姓名"
                        value={handlerName}
                        onChange={(e) => setHandlerName(e.target.value)}
                      />
                    </div>
                  </Card>

                  <div className="return-actions">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={submitting}
                      icon={submitting ? <RefreshCw size={18} className="spin" /> : <CheckCircle size={18} />}
                    >
                      {submitting ? '提交中...' : '确认核对完成'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Card title="核对结果" className="mt-4">
                    <div className="result-info">
                      <div className="result-item">
                        <span className="result-label">司机说明</span>
                        <p className="result-text">{selectedRecord.driverExplanation || '无'}</p>
                      </div>

                      <div className="result-tags">
                        <span className={`result-tag ${selectedRecord.needRepair ? 'active' : ''}`}>
                          <Wrench size={12} />
                          需维修门磁
                          {selectedRecord.needRepair ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        </span>
                        <span className={`result-tag ${selectedRecord.needReview ? 'active' : ''}`}>
                          <RotateCcw size={12} />
                          复盘装卸流程
                          {selectedRecord.needReview ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        </span>
                        <span className={`result-tag ${selectedRecord.needQualityControl ? 'active' : ''}`}>
                          <Flag size={12} />
                          上报质控
                          {selectedRecord.needQualityControl ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        </span>
                      </div>

                      {selectedRecord.remarks && (
                        <div className="result-item">
                          <span className="result-label">处理备注</span>
                          <p className="result-text">{selectedRecord.remarks}</p>
                        </div>
                      )}

                      <div className="result-item">
                        <span className="result-label">处理人</span>
                        <span className="result-value">{selectedRecord.handlerName}</span>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </>
          ) : (
            <div className="empty-state large">
              <div className="empty-state-icon">
                <RotateCcw size={48} />
              </div>
              <div className="empty-state-text">请从左侧选择车辆进行返场核对</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

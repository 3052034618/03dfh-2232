import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, FileText, ShieldCheck, User, Download, Search, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockVehicles, mockSealRecords, mockDoorMagnetStatuses } from '../data/mockData';
import { formatDateTime, generateId } from '../utils/format';
import type { SealRecord } from '../types';

interface SealRecordPageProps {
  preselectedVehicleId?: string | null;
}

export const SealRecordPage: React.FC<SealRecordPageProps> = ({ preselectedVehicleId = null }) => {
  const [activeTab, setActiveTab] = useState<'seal' | 'records'>('seal');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(preselectedVehicleId);
  const [sealNumber, setSealNumber] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [sealRecords, setSealRecords] = useState<SealRecord[]>(mockSealRecords);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selectedVehicle = mockVehicles.find(v => v.id === selectedVehicleId) || null;
  const doorStatus = mockDoorMagnetStatuses.find(d => d.vehicleId === selectedVehicleId) || null;

  const availableVehicles = mockVehicles.filter(v => {
    const ds = mockDoorMagnetStatuses.find(d => d.vehicleId === v.id);
    return ds?.isOnline && ds?.isDoorClosed;
  });

  const filteredRecords = sealRecords.filter(r =>
    r.plateNumber.includes(searchTerm) ||
    r.sealNumber.includes(searchTerm)
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
    } catch (err) {
      alert('无法访问摄像头失败，请检查设备权限');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoUrl(dataUrl);
      }
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setPhotoUrl(null);
    startCamera();
  };

  const removePhoto = () => {
    setPhotoUrl(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (preselectedVehicleId) {
      setSelectedVehicleId(preselectedVehicleId);
      setActiveTab('seal');
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const seq = String(sealRecords.length + 1).padStart(3, '0');
      setSealNumber(`SL-${dateStr}-${seq}`);
    }
  }, [preselectedVehicleId]);

  const handleSubmit = () => {
    if (!selectedVehicleId || !sealNumber) {
      alert('请选择车辆并填写封签号');
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const now = new Date().toISOString();
      const newRecord: SealRecord = {
        id: generateId('sr'),
        vehicleId: selectedVehicleId,
        plateNumber: selectedVehicle?.plateNumber || '',
        sealNumber,
        photoUrl,
        doorCloseTime: doorStatus?.lastCloseTime || now,
        releaseTime: now,
        operatorName: operatorName || '系统默认',
        supervisorName: supervisorName || '系统默认',
        remarks,
        loadingRecordId: ''
      };

      setSealRecords(prev => [newRecord, ...prev]);
      setSubmitting(false);
      setActiveTab('records');

      setSealNumber('');
      setOperatorName('');
      setSupervisorName('');
      setRemarks('');
      setPhotoUrl(null);
      setSelectedVehicleId(null);
    }, 1500);
  };

  const generateSealNumber = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(sealRecords.length + 1).padStart(3, '0');
    return `SL-${dateStr}-${seq}`;
  };

  return (
    <div className="seal-page">
      <div className="seal-tabs">
        <button
          className={`tab-button ${activeTab === 'seal' ? 'active' : ''}`}
          onClick={() => setActiveTab('seal')}
        >
          <ShieldCheck size={16} />
          封车操作
        </button>
        <button
          className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <FileText size={16} />
          封车记录
          <span className="tab-badge">{sealRecords.length}</span>
        </button>
      </div>

      {activeTab === 'seal' ? (
        <div className="seal-form-container">
          <div className="seal-form-left">
          <Card title="选择车辆" subtitle="选择待封车车辆">
            <div className="vehicle-select-list">
              {availableVehicles.length === 0 ? (
              <div className="empty-state">
              <div className="empty-state-icon">🚛</div>
              <div className="empty-state-text">暂无可封车车辆</div>
            </div>
            ) : (
              availableVehicles.map(vehicle => {
              const ds = mockDoorMagnetStatuses.find(d => d.vehicleId === vehicle.id);
              const isSelected = selectedVehicleId === vehicle.id;
              
              return (
                <div
                key={vehicle.id}
                className={`vehicle-select-item ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  const today = new Date();
                  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                  const seq = String(sealRecords.length + 1).padStart(3, '0');
                  setSealNumber(`SL-${dateStr}-${seq}`);
                }}
                >
                <div className="vehicle-select-header">
                  <span className="vehicle-plate mono-text">{vehicle.plateNumber}</span>
                  <StatusBadge status="success" text="可封车" />
                </div>
                <div className="vehicle-select-info">
                  <span>{vehicle.vehicleType}</span>
                  <span>司机：{vehicle.driverName}</span>
                </div>
                {ds && (
                <div className="vehicle-select-status">
                  <span className="status-item">
                    <span className="status-dot status-online"></span>
                    门磁在线
                  </span>
                  <span className="status-item">
                    <span className="status-dot status-online"></span>
                    车门已关
                  </span>
                </div>
                )}
              </div>
              );
            })
            )}
          </div>
          </Card>

          {selectedVehicle && doorStatus && (
          <Card title="门磁验证信息" className="mt-4">
            <div className="seal-info-item">
              <span className="seal-info-label">车牌号码</span>
              <span className="seal-info-value mono-text">{selectedVehicle.plateNumber}</span>
            </div>
            <div className="seal-info-item">
              <span className="seal-info-label">门磁编号</span>
              <span className="seal-info-value mono-text">{doorStatus.id}</span>
            </div>
            <div className="seal-info-item">
              <span className="seal-info-label">车门关闭时间</span>
              <span className="seal-info-value mono-text">{formatDateTime(doorStatus.lastCloseTime)}</span>
            </div>
            <div className="seal-info-item">
              <span className="seal-info-label">电池电量</span>
              <span className="seal-info-value">{doorStatus.batteryLevel}%</span>
            </div>
          </Card>
          )}
        </div>

        <div className="seal-form-right">
          <Card title="封车信息录入" subtitle="请填写封车相关信息">
            <div className="form-group">
              <label className="form-label">封签号</label>
              <div className="input-with-action">
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入或生成封签号"
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                />
                <Button variant="secondary" size="sm" onClick={() => setSealNumber(generateSealNumber())}>
                  <RefreshCw size={14} />
                  生成
                </Button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> 操作员
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入操作员姓名"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <User size={14} /> 主管确认
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="请输入主管姓名"
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">备注信息</label>
              <textarea
                className="form-textarea"
                placeholder="请输入备注信息（可选）"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </Card>

          <Card
            title="车门拍照留证"
            subtitle="拍摄车门闭合照片作为出库凭证"
            className="mt-4"
          >
            <div className="photo-capture-area">
              {showCamera ? (
                <div className="camera-viewfinder">
                  <video ref={videoRef} autoPlay playsInline className="camera-video" />
                  <div className="camera-overlay">
                    <div className="camera-frame" />
                    <div className="scan-line" />
                  </div>
                  <div className="camera-controls">
                    <Button variant="secondary" onClick={stopCamera}>
                      <X size={16} />
                      取消
                    </Button>
                    <Button variant="primary" size="lg" onClick={capturePhoto}>
                      <Camera size={18} />
                      拍照
                    </Button>
                  </div>
                </div>
              ) : photoUrl ? (
                <div className="photo-preview">
                  <img src={photoUrl} alt="车门照片" className="captured-photo" />
                  <div className="photo-actions">
                    <Button variant="secondary" size="sm" onClick={retakePhoto}>
                      <RefreshCw size={14} />
                      重拍
                    </Button>
                    <Button variant="danger" size="sm" onClick={removePhoto}>
                      <Trash2 size={14} />
                      删除
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="photo-placeholder" onClick={startCamera}>
                  <Camera size={48} className="placeholder-icon" />
                  <p>点击拍摄车门照片</p>
                  <span>支持摄像头实时拍照留证</span>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Card>

          <div className="seal-actions">
            <Button
              variant="success"
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedVehicleId || !sealNumber || submitting}
              icon={submitting ? <RefreshCw size={18} className="spin" /> : <ShieldCheck size={18} />}
            >
              {submitting ? '提交中...' : '确认封车并放行'}
            </Button>
          </div>

          <div className="seal-note">
            <AlertTriangle size={14} />
            <span>封车后将生成出库凭证，门磁关闭时间与发车放行时间将自动绑定</span>
          </div>
        </div>
      </div>
      ) : (
        <Card
          title="封车记录"
          subtitle={`共 ${sealRecords.length} 条记录`}
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
          <div className="record-list">
            {filteredRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <FileText size={48} />
                </div>
                <div className="empty-state-text">暂无封车记录</div>
              </div>
            ) : (
              filteredRecords.map(record => (
                <div key={record.id} className="record-card">
                  <div className="record-card-header">
                <div className="record-vehicle">
                  <span className="record-plate mono-text">{record.plateNumber}</span>
                  <StatusBadge status="success" text="已封车" />
                </div>
                <div className="record-actions">
                  <Button variant="secondary" size="sm">
                    <Download size={14} />
                    凭证
                  </Button>
                </div>
              </div>
              <div className="record-card-body">
                <div className="record-info-grid">
                  <div className="record-info-item">
                    <span className="record-info-label">封签号</span>
                    <span className="record-info-value mono-text">{record.sealNumber}</span>
                  </div>
                  <div className="record-info-item">
                    <span className="record-info-label">操作员</span>
                    <span className="record-info-value">{record.operatorName}</span>
                  </div>
                  <div className="record-info-item">
                    <span className="record-info-label">主管</span>
                    <span className="record-info-value">{record.supervisorName}</span>
                  </div>
                  <div className="record-info-item">
                    <span className="record-info-label">门磁关闭时间</span>
                    <span className="record-info-value mono-text">{formatDateTime(record.doorCloseTime)}</span>
                  </div>
                  <div className="record-info-item">
                    <span className="record-info-label">发车放行时间</span>
                    <span className="record-info-value mono-text">{formatDateTime(record.releaseTime)}</span>
                  </div>
                  <div className="record-info-item">
                    <span className="record-info-label">照片凭证</span>
                    <span className="record-info-value">
                      {record.photoUrl ? <CheckCircle size={14} className="text-green" /> : '无'}
                    </span>
                  </div>
                </div>
                {record.remarks && (
                  <div className="record-remarks">
                    <span className="record-remarks-label">备注：</span>
                    {record.remarks}
                  </div>
                )}
              </div>
            </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

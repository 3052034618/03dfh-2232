import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, CheckCircle, FileText, ShieldCheck, User, Download, Search, RefreshCw, AlertTriangle, Trash2, ImageOff } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { mockVehicles, mockSealRecords, mockDoorMagnetStatuses } from '../data/mockData';
import { formatDateTime, generateId } from '../utils/format';
import { loadSealRecords, saveSealRecords } from '../utils/storage';
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
  const [hasPhoto, setHasPhoto] = useState(false);
  const [cameraState, setCameraState] = useState<'idle' | 'opening' | 'streaming' | 'error' | 'captured'>('idle');
  const [cameraError, setCameraError] = useState('');
  const [sealRecords, setSealRecords] = useState<SealRecord[]>(() => loadSealRecords(mockSealRecords));
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

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setCameraState('opening');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraState('streaming');
    } catch (err: any) {
      stopStream();
      const msg = err?.name === 'NotAllowedError'
        ? '摄像头权限被拒绝，请在浏览器设置中允许访问摄像头'
        : err?.name === 'NotFoundError'
          ? '未检测到摄像头设备'
          : '摄像头启动失败，请检查设备连接';
      setCameraError(msg);
      setCameraState('error');
    }
  }, [stopStream]);

  const stopCamera = useCallback(() => {
    stopStream();
    setCameraState('idle');
  }, [stopStream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoUrl(dataUrl);
        setHasPhoto(true);
      }
      stopStream();
      setCameraState('captured');
    }
  }, [stopStream]);

  const retakePhoto = useCallback(() => {
    setPhotoUrl(null);
    setHasPhoto(false);
    setCameraState('idle');
    setTimeout(() => startCamera(), 100);
  }, [startCamera]);

  const removePhoto = useCallback(() => {
    setPhotoUrl(null);
    setHasPhoto(false);
    setCameraState('idle');
  }, []);

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

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

  useEffect(() => {
    saveSealRecords(sealRecords);
  }, [sealRecords]);

  const handleSubmit = () => {
    if (!selectedVehicleId || !sealNumber) {
      alert('请选择车辆并填写封签号');
      return;
    }
    if (!hasPhoto) {
      alert('请先拍摄车门闭合照片，拍照后方可生成出库凭证');
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
        photoUrl: hasPhoto ? '(photo-captured)' : null,
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
      setHasPhoto(false);
      setCameraState('idle');
      setSelectedVehicleId(null);
    }, 1500);
  };

  const generateSealNumber = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(sealRecords.length + 1).padStart(3, '0');
    return `SL-${dateStr}-${seq}`;
  };

  const renderCameraArea = () => {
    switch (cameraState) {
      case 'opening':
        return (
          <div className="camera-viewfinder camera-loading">
            <div className="camera-loading-content">
              <RefreshCw size={32} className="spin" />
              <p>正在启动摄像头...</p>
            </div>
          </div>
        );

      case 'streaming':
        return (
          <div className="camera-viewfinder">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
            />
            <div className="camera-overlay">
              <div className="camera-frame" />
              <div className="camera-hint">对准车门闭合处，点击拍照</div>
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
        );

      case 'error':
        return (
          <div className="photo-placeholder camera-error">
            <ImageOff size={48} className="placeholder-icon error-icon" />
            <p className="error-text">{cameraError}</p>
            <Button variant="secondary" size="sm" onClick={startCamera} className="mt-4">
              <RefreshCw size={14} />
              重新尝试
            </Button>
          </div>
        );

      case 'captured':
        return (
          <div className="photo-preview">
            {photoUrl ? (
              <img src={photoUrl} alt="车门闭合照片" className="captured-photo" />
            ) : (
              <div className="photo-captured-fallback">
                <CheckCircle size={48} className="text-green" />
                <p>照片已拍摄</p>
              </div>
            )}
            <div className="photo-preview-bar">
              <span className="photo-preview-status">
                <CheckCircle size={14} className="text-green" />
                照片已拍摄，可作为出库凭证
              </span>
              <div className="photo-actions-inline">
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
          </div>
        );

      default:
        return (
          <div className="photo-placeholder" onClick={startCamera}>
            <Camera size={48} className="placeholder-icon" />
            <p>点击拍摄车门照片</p>
            <span>拍照后可生成出库凭证</span>
          </div>
        );
    }
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
              subtitle="拍摄车门闭合照片后方可生成出库凭证"
              className="mt-4"
            >
              <div className="photo-capture-area">
                {renderCameraArea()}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Card>

            {!hasPhoto && selectedVehicleId && sealNumber && (
              <div className="alert-box alert-warning mt-4">
                <div className="alert-title">
                  <AlertTriangle size={16} />
                  照片未拍摄
                </div>
                <div className="alert-message">
                  请先拍摄车门闭合照片，拍照完成后方可生成出库凭证。
                </div>
              </div>
            )}

            <div className="seal-actions">
              <Button
                variant="success"
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedVehicleId || !sealNumber || !hasPhoto || submitting}
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
                          {record.photoUrl ? (
                            <span className="photo-saved-badge">
                              <CheckCircle size={14} className="text-green" />
                              已留存
                            </span>
                          ) : (
                            <span className="text-yellow">未拍照</span>
                          )}
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

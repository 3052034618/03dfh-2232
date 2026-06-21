import type { Vehicle, DoorMagnetStatus, LoadingRecord, SealRecord, ReturnRecord, DoorAbnormality } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: 'v001',
    plateNumber: '沪A·88629',
    driverName: '张建国',
    driverPhone: '138****1234',
    vehicleType: '9.6米冷藏车',
    temperature: -18.5,
    doorMagnetId: 'dm-001',
    lastMaintenanceDate: '2026-05-15'
  },
  {
    id: 'v002',
    plateNumber: '沪B·37215',
    driverName: '李卫东',
    driverPhone: '139****5678',
    vehicleType: '6.8米冷藏车',
    temperature: -22.0,
    doorMagnetId: 'dm-002',
    lastMaintenanceDate: '2026-06-01'
  },
  {
    id: 'v003',
    plateNumber: '沪C·15078',
    driverName: '王海涛',
    driverPhone: '137****9012',
    vehicleType: '12.5米冷藏车',
    temperature: -18.0,
    doorMagnetId: 'dm-003',
    lastMaintenanceDate: '2026-04-20'
  },
  {
    id: 'v004',
    plateNumber: '沪D·66324',
    driverName: '赵志强',
    driverPhone: '136****3456',
    vehicleType: '9.6米冷藏车',
    temperature: -20.0,
    doorMagnetId: 'dm-004',
    lastMaintenanceDate: '2026-06-10'
  },
  {
    id: 'v005',
    plateNumber: '沪E·50917',
    driverName: '刘建华',
    driverPhone: '135****7890',
    vehicleType: '7.6米冷藏车',
    temperature: -18.0,
    doorMagnetId: 'dm-005',
    lastMaintenanceDate: '2026-05-28'
  },
  {
    id: 'v006',
    plateNumber: '沪F·88192',
    driverName: '陈明辉',
    driverPhone: '133****2345',
    vehicleType: '12.5米冷藏车',
    temperature: -25.0,
    doorMagnetId: 'dm-006',
    lastMaintenanceDate: '2026-06-15'
  }
];

const now = new Date();

export const mockDoorMagnetStatuses: DoorMagnetStatus[] = [
  {
    id: 'dm-001',
    vehicleId: 'v001',
    isOnline: true,
    isDoorClosed: true,
    lastOpenTime: new Date(now.getTime() - 1000 * 60 * 25).toISOString(),
    lastCloseTime: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
    batteryLevel: 85,
    signalStrength: 92,
    lastUpdateTime: new Date(now.getTime() - 1000 * 30).toISOString()
  },
  {
    id: 'dm-002',
    vehicleId: 'v002',
    isOnline: true,
    isDoorClosed: false,
    lastOpenTime: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
    lastCloseTime: null,
    batteryLevel: 62,
    signalStrength: 88,
    lastUpdateTime: new Date(now.getTime() - 1000 * 15).toISOString()
  },
  {
    id: 'dm-003',
    vehicleId: 'v003',
    isOnline: true,
    isDoorClosed: true,
    lastOpenTime: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
    lastCloseTime: new Date(now.getTime() - 1000 * 60 * 110).toISOString(),
    batteryLevel: 91,
    signalStrength: 95,
    lastUpdateTime: new Date(now.getTime() - 1000 * 45).toISOString()
  },
  {
    id: 'dm-004',
    vehicleId: 'v004',
    isOnline: false,
    isDoorClosed: true,
    lastOpenTime: new Date(now.getTime() - 1000 * 60 * 300).toISOString(),
    lastCloseTime: new Date(now.getTime() - 1000 * 60 * 290).toISOString(),
    batteryLevel: 15,
    signalStrength: 0,
    lastUpdateTime: new Date(now.getTime() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'dm-005',
    vehicleId: 'v005',
    isOnline: true,
    isDoorClosed: true,
    lastOpenTime: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
    lastCloseTime: new Date(now.getTime() - 1000 * 60 * 38).toISOString(),
    batteryLevel: 78,
    signalStrength: 75,
    lastUpdateTime: new Date(now.getTime() - 1000 * 20).toISOString()
  },
  {
    id: 'dm-006',
    vehicleId: 'v006',
    isOnline: true,
    isDoorClosed: true,
    lastOpenTime: new Date(now.getTime() - 1000 * 60 * 8).toISOString(),
    lastCloseTime: new Date(now.getTime() - 1000 * 60 * 2).toISOString(),
    batteryLevel: 45,
    signalStrength: 68,
    lastUpdateTime: new Date(now.getTime() - 1000 * 10).toISOString()
  }
];

export const mockLoadingRecords: LoadingRecord[] = [
  {
    id: 'ld-001',
    vehicleId: 'v001',
    plateNumber: '沪A·88629',
    loadingStartTime: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
    loadingEndTime: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    status: 'completed',
    dockNumber: 'A-03',
    goodsType: '冷冻肉制品',
    weight: 12500
  },
  {
    id: 'ld-002',
    vehicleId: 'v002',
    plateNumber: '沪B·37215',
    loadingStartTime: new Date(now.getTime() - 1000 * 60 * 40).toISOString(),
    loadingEndTime: null,
    status: 'loading',
    dockNumber: 'B-01',
    goodsType: '速冻水饺',
    weight: 6800
  },
  {
    id: 'ld-003',
    vehicleId: 'v006',
    plateNumber: '沪F·88192',
    loadingStartTime: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
    loadingEndTime: null,
    status: 'loading',
    dockNumber: 'A-01',
    goodsType: '冰淇淋',
    weight: 18000
  }
];

export const mockSealRecords: SealRecord[] = [
  {
    id: 'sr-001',
    vehicleId: 'v003',
    plateNumber: '沪C·15078',
    sealNumber: 'SL-2026-0621-001',
    photoUrl: null,
    doorCloseTime: new Date(now.getTime() - 1000 * 60 * 200).toISOString(),
    releaseTime: new Date(now.getTime() - 1000 * 60 * 195).toISOString(),
    operatorName: '王主管',
    supervisorName: '李经理',
    remarks: '正常发车',
    loadingRecordId: 'ld-003'
  },
  {
    id: 'sr-002',
    vehicleId: 'v005',
    plateNumber: '沪E·50917',
    sealNumber: 'SL-2026-0621-002',
    photoUrl: null,
    doorCloseTime: new Date(now.getTime() - 1000 * 60 * 150).toISOString(),
    releaseTime: new Date(now.getTime() - 1000 * 60 * 145).toISOString(),
    operatorName: '张主管',
    supervisorName: '王经理',
    remarks: '',
    loadingRecordId: 'ld-004'
  }
];

export const mockDoorAbnormalities: DoorAbnormality[] = [
  {
    id: 'ab-001',
    openTime: '2026-06-21T08:30:00.000Z',
    closeTime: '2026-06-21T08:35:30.000Z',
    duration: 330,
    location: 'G15高速服务区',
    temperatureChange: 2.5,
    severity: 'medium'
  },
  {
    id: 'ab-002',
    openTime: '2026-06-21T10:15:00.000Z',
    closeTime: '2026-06-21T10:16:20.000Z',
    duration: 80,
    location: '途中',
    temperatureChange: 0.8,
    severity: 'low'
  },
  {
    id: 'ab-003',
    openTime: '2026-06-21T12:45:00.000Z',
    closeTime: null as any,
    duration: 0,
    location: '未知',
    temperatureChange: 5.2,
    severity: 'high'
  }
];

export const mockReturnRecords: ReturnRecord[] = [
  {
    id: 'rr-001',
    vehicleId: 'v003',
    plateNumber: '沪C·15078',
    returnTime: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    sealNumber: 'SL-2026-0620-008',
    sealIntact: true,
    doorAbnormalities: [mockDoorAbnormalities[0], mockDoorAbnormalities[1]],
    driverExplanation: '中途在服务区休息，开门检查货物温度',
    needRepair: false,
    needReview: true,
    needQualityControl: false,
    handlerName: '陈主管',
    remarks: '需复盘装卸流程'
  },
  {
    id: 'rr-002',
    vehicleId: 'v004',
    plateNumber: '沪D·66324',
    returnTime: new Date(now.getTime() - 1000 * 60 * 60 * 12).toISOString(),
    sealNumber: 'SL-2026-0620-005',
    sealIntact: false,
    doorAbnormalities: [mockDoorAbnormalities[2]],
    driverExplanation: '门磁设备故障，无异常开门',
    needRepair: true,
    needReview: false,
    needQualityControl: true,
    handlerName: '李主管',
    remarks: '门磁需维修，已上报质控'
  }
];

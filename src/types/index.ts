export interface Vehicle {
  id: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  vehicleType: string;
  temperature: number;
  doorMagnetId: string;
  lastMaintenanceDate: string;
}

export interface DoorMagnetStatus {
  id: string;
  vehicleId: string;
  isOnline: boolean;
  isDoorClosed: boolean;
  lastOpenTime: string | null;
  lastCloseTime: string | null;
  batteryLevel: number;
  signalStrength: number;
  lastUpdateTime: string;
}

export interface LoadingRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  loadingStartTime: string;
  loadingEndTime: string | null;
  status: 'loading' | 'completed' | 'cancelled';
  dockNumber: string;
  goodsType: string;
  weight: number;
}

export interface SealRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  sealNumber: string;
  photoUrl: string | null;
  doorCloseTime: string;
  releaseTime: string;
  operatorName: string;
  supervisorName: string;
  remarks: string;
  loadingRecordId: string;
}

export interface ReturnRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  returnTime: string;
  sealNumber: string;
  sealIntact: boolean;
  doorAbnormalities: DoorAbnormality[];
  driverExplanation: string;
  needRepair: boolean;
  needReview: boolean;
  needQualityControl: boolean;
  handlerName: string;
  remarks: string;
}

export interface DoorAbnormality {
  id: string;
  openTime: string;
  closeTime: string;
  duration: number;
  location: string;
  temperatureChange: number;
  severity: 'low' | 'medium' | 'high';
}

export type TabType = 'inspection' | 'seal' | 'return';

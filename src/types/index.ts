export interface Vehicle {
  id: string;
  plateNumber: string;
  plateConfidence: number;
  hasPlate: boolean;
  vehicleType: 'car' | 'truck' | 'motorcycle' | 'van' | 'bus';
  color: string;
  brand: string;
  entryTime: Date;
  exitTime?: Date;
  captureImage: string;
  lane: string;
  direction: 'in' | 'out';
  ownerName?: string;
  ownerPhone?: string;
  remark?: string;
  noPlateRegistered?: boolean;
}

export interface ParkingSpace {
  id: string;
  number: string;
  area: string;
  status: 'occupied' | 'available' | 'reserved';
  licensePlate?: string;
}

export interface Device {
  id: string;
  name: string;
  type: 'camera' | 'gate' | 'display' | 'reader' | 'intercom';
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastHeartbeat: Date;
}

export interface Alert {
  id: string;
  type: 'device_offline' | 'full_parking' | 'congestion' | 'suspicious' | 'system_error';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  deviceId?: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface FeeRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  entryTime: Date;
  exitTime: Date;
  duration: number;
  baseFee: number;
  totalFee: number;
  discount: number;
  actualFee: number;
  paymentMethod: 'cash' | 'wechat' | 'alipay' | 'free';
  status: 'pending' | 'paid' | 'free_pass';
  operatorId: string;
  operatorName: string;
  timestamp: Date;
}

export interface ShiftRecord {
  id: string;
  operatorId: string;
  operatorName: string;
  startTime: Date;
  endTime?: Date;
  cashCollection: number;
  electronicCollection: number;
  totalCollection: number;
  vehicleCount: number;
  freePassCount: number;
  status: 'active' | 'closed';
}

export interface OperationLog {
  id: string;
  operatorId: string;
  operatorName: string;
  action: string;
  detail: string;
  plateNumber?: string;
  deviceId?: string;
  timestamp: Date;
  ipAddress: string;
}

export interface LaneQueue {
  id: string;
  laneName: string;
  direction: 'in' | 'out';
  waitingCount: number;
  averageWaitTime: number;
  vehicles: Vehicle[];
  status: 'normal' | 'busy' | 'congested';
}

export interface IntercomSession {
  id: string;
  deviceId: string;
  deviceName: string;
  startTime: Date;
  status: 'calling' | 'connected' | 'ended';
  operatorId?: string;
}

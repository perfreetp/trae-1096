import type { Vehicle, Device, Alert, FeeRecord, ShiftRecord, OperationLog, LaneQueue, ParkingSpace } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const plateNumbers = [
  '京A12345', '京B67890', '沪C11111', '粤D22222', '川E33333',
  '鄂F44444', '湘G55555', '鲁H66666', '苏J77777', '浙K88888',
  '皖L99999', '闽M00000', '陕N12345', '甘P67890', '云Q11111'
];

const brands = ['大众', '丰田', '本田', '别克', '奔驰', '宝马', '奥迪', '比亚迪', '特斯拉', '吉利'];
const colors = ['白色', '黑色', '银色', '灰色', '红色', '蓝色', '香槟色'];

export const mockVehicles: Vehicle[] = Array.from({ length: 20 }, (_, i) => ({
  id: generateId(),
  plateNumber: plateNumbers[i % plateNumbers.length],
  plateConfidence: Math.random() * 0.2 + 0.8,
  hasPlate: Math.random() > 0.1,
  vehicleType: Math.random() > 0.8 ? 'truck' : 'car',
  color: colors[Math.floor(Math.random() * colors.length)],
  brand: brands[Math.floor(Math.random() * brands.length)],
  entryTime: new Date(Date.now() - Math.random() * 3600000 * 4),
  exitTime: i < 5 ? new Date(Date.now() - Math.random() * 3600000) : undefined,
  captureImage: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('parking lot entrance security camera car license plate recognition')}&image_size=landscape_16_9`,
  lane: `车道${(i % 4) + 1}`,
  direction: i % 2 === 0 ? 'in' : 'out'
}));

export const mockDevices: Device[] = [
  { id: '1', name: '入口1号摄像机', type: 'camera', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '2', name: '入口2号摄像机', type: 'camera', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '3', name: '出口1号摄像机', type: 'camera', location: '南出口', status: 'online', lastHeartbeat: new Date() },
  { id: '4', name: '出口2号摄像机', type: 'camera', location: '南出口', status: 'warning', lastHeartbeat: new Date(Date.now() - 120000) },
  { id: '5', name: '入口道闸1', type: 'gate', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '6', name: '入口道闸2', type: 'gate', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '7', name: '出口道闸1', type: 'gate', location: '南出口', status: 'online', lastHeartbeat: new Date() },
  { id: '8', name: '出口道闸2', type: 'gate', location: '南出口', status: 'offline', lastHeartbeat: new Date(Date.now() - 600000) },
  { id: '9', name: '入口显示屏1', type: 'display', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '10', name: '入口读卡器1', type: 'reader', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '11', name: '入口对讲1', type: 'intercom', location: '东入口', status: 'online', lastHeartbeat: new Date() },
  { id: '12', name: '出口对讲1', type: 'intercom', location: '南出口', status: 'online', lastHeartbeat: new Date() }
];

export const mockAlerts: Alert[] = [
  { id: '1', type: 'device_offline', severity: 'error', message: '出口道闸2设备离线', deviceId: '8', timestamp: new Date(Date.now() - 300000), acknowledged: false },
  { id: '2', type: 'congestion', severity: 'warning', message: '出口车道排队超过5辆车', timestamp: new Date(Date.now() - 600000), acknowledged: true },
  { id: '3', type: 'full_parking', severity: 'warning', message: '停车位使用率超过90%', timestamp: new Date(Date.now() - 1800000), acknowledged: false },
  { id: '4', type: 'system_error', severity: 'critical', message: '数据库连接异常', timestamp: new Date(Date.now() - 3600000), acknowledged: true },
  { id: '5', type: 'suspicious', severity: 'info', message: '检测到无牌车辆进入', timestamp: new Date(Date.now() - 120000), acknowledged: false }
];

export const mockFeeRecords: FeeRecord[] = Array.from({ length: 15 }, (_, i) => {
  const entryTime = new Date(Date.now() - (Math.random() * 3600000 * 8 + 1800000));
  const exitTime = new Date(entryTime.getTime() + Math.random() * 3600000 * 3);
  const duration = Math.ceil((exitTime.getTime() - entryTime.getTime()) / 3600000);
  const baseFee = 5;
  const hourlyRate = 3;
  const totalFee = baseFee + Math.max(0, duration - 1) * hourlyRate;
  const discount = Math.random() > 0.7 ? Math.floor(totalFee * 0.2) : 0;
  const actualFee = totalFee - discount;
  const methods: ('cash' | 'wechat' | 'alipay' | 'free')[] = ['cash', 'wechat', 'alipay', 'cash', 'wechat'];
  
  return {
    id: generateId(),
    vehicleId: generateId(),
    plateNumber: plateNumbers[i % plateNumbers.length],
    entryTime,
    exitTime,
    duration,
    baseFee,
    totalFee,
    discount,
    actualFee: i === 3 ? 0 : actualFee,
    paymentMethod: i === 3 ? 'free' : methods[i % methods.length],
    status: i < 3 ? 'pending' : (i === 3 ? 'free_pass' : 'paid'),
    operatorId: 'op001',
    operatorName: '张值班',
    timestamp: exitTime
  };
});

export const mockShiftRecord: ShiftRecord = {
  id: 'shift001',
  operatorId: 'op001',
  operatorName: '张值班',
  startTime: new Date(Date.now() - 28800000),
  cashCollection: 856,
  electronicCollection: 2340,
  totalCollection: 3196,
  vehicleCount: 156,
  freePassCount: 8,
  status: 'active'
};

export const mockOperationLogs: OperationLog[] = [
  { id: '1', operatorId: 'op001', operatorName: '张值班', action: '道闸控制', detail: '手动开启入口道闸1', plateNumber: '京A12345', deviceId: '5', timestamp: new Date(Date.now() - 300000), ipAddress: '192.168.1.100' },
  { id: '2', operatorId: 'op001', operatorName: '张值班', action: '车牌修正', detail: '将识别结果"京A1234S"修正为"京A12345"', plateNumber: '京A12345', timestamp: new Date(Date.now() - 600000), ipAddress: '192.168.1.100' },
  { id: '3', operatorId: 'op001', operatorName: '张值班', action: '免费放行', detail: '特殊车辆免费放行审批通过', plateNumber: '京B67890', timestamp: new Date(Date.now() - 900000), ipAddress: '192.168.1.100' },
  { id: '4', operatorId: 'op001', operatorName: '张值班', action: '现金收款', detail: '收取现金停车费35元', plateNumber: '沪C11111', timestamp: new Date(Date.now() - 1200000), ipAddress: '192.168.1.100' },
  { id: '5', operatorId: 'op001', operatorName: '张值班', action: '语音对讲', detail: '与入口对讲1通话结束，时长45秒', deviceId: '11', timestamp: new Date(Date.now() - 1800000), ipAddress: '192.168.1.100' },
  { id: '6', operatorId: 'op002', operatorName: '李值班', action: '登录系统', detail: '用户登录成功', timestamp: new Date(Date.now() - 28800000), ipAddress: '192.168.1.101' },
  { id: '7', operatorId: 'op001', operatorName: '张值班', action: '无牌车建档', detail: '为无牌车辆建立临时档案', timestamp: new Date(Date.now() - 3600000), ipAddress: '192.168.1.100' },
  { id: '8', operatorId: 'op001', operatorName: '张值班', action: '告警确认', detail: '确认设备离线告警：出口道闸2', timestamp: new Date(Date.now() - 7200000), ipAddress: '192.168.1.100' }
];

export const mockLaneQueues: LaneQueue[] = [
  {
    id: 'q1',
    laneName: '入口车道1',
    direction: 'in',
    waitingCount: 2,
    averageWaitTime: 45,
    status: 'normal',
    vehicles: mockVehicles.filter(v => v.direction === 'in').slice(0, 2)
  },
  {
    id: 'q2',
    laneName: '入口车道2',
    direction: 'in',
    waitingCount: 1,
    averageWaitTime: 30,
    status: 'normal',
    vehicles: mockVehicles.filter(v => v.direction === 'in').slice(2, 3)
  },
  {
    id: 'q3',
    laneName: '出口车道1',
    direction: 'out',
    waitingCount: 4,
    averageWaitTime: 120,
    status: 'busy',
    vehicles: mockVehicles.filter(v => v.direction === 'out').slice(0, 4)
  },
  {
    id: 'q4',
    laneName: '出口车道2',
    direction: 'out',
    waitingCount: 6,
    averageWaitTime: 180,
    status: 'congested',
    vehicles: mockVehicles.filter(v => v.direction === 'out').slice(0, 6)
  }
];

export const mockParkingSpaces: ParkingSpace[] = Array.from({ length: 100 }, (_, i) => ({
  id: `space${i + 1}`,
  number: `A${String(i + 1).padStart(3, '0')}`,
  area: 'A区',
  status: Math.random() > 0.15 ? 'occupied' : 'available',
  licensePlate: Math.random() > 0.15 ? plateNumbers[i % plateNumbers.length] : undefined
}));

export const parkingStats = {
  totalSpaces: 500,
  occupiedSpaces: 432,
  availableSpaces: 68,
  reservedSpaces: 0,
  todayEntries: 856,
  todayExits: 720,
  currentVehicles: 136
};

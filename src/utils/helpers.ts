export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) {
    return `${mins}分钟`;
  }
  return `${hours}小时${mins}分钟`;
}

export function calculateParkingDuration(entryTime: Date, exitTime: Date): number {
  const diffMs = exitTime.getTime() - entryTime.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60)));
}

export interface ParkingFeeResult {
  baseFee: number;
  totalFee: number;
  discount: number;
  actualFee: number;
  durationMinutes: number;
  durationText: string;
  feeDetails: {
    name: string;
    value: number;
    unit: string;
  }[];
}

export function calculateParkingFee(
  entryTime: Date,
  exitTime: Date,
  vehicleType: string = 'car'
): ParkingFeeResult {
  const durationMinutes = calculateParkingDuration(entryTime, exitTime);
  const durationHours = Math.ceil(durationMinutes / 60);

  let baseRate = 5;
  let hourlyRate = 3;
  let maxDailyFee = 50;

  if (vehicleType === 'truck' || vehicleType === 'bus') {
    baseRate = 10;
    hourlyRate = 6;
    maxDailyFee = 100;
  } else if (vehicleType === 'van') {
    baseRate = 8;
    hourlyRate = 4;
    maxDailyFee = 80;
  }

  const firstHourFee = baseRate;
  let additionalHoursFee = 0;

  if (durationHours > 1) {
    additionalHoursFee = (durationHours - 1) * hourlyRate;
  }

  let totalFee = firstHourFee + additionalHoursFee;
  totalFee = Math.min(totalFee, maxDailyFee);

  const feeDetails = [
    { name: '首小时费用', value: firstHourFee, unit: '元' },
    { name: `后续${Math.max(0, durationHours - 1)}小时`, value: additionalHoursFee, unit: '元' },
    { name: '停车时长', value: durationMinutes, unit: '分钟' }
  ];

  return {
    baseFee: firstHourFee,
    totalFee,
    discount: 0,
    actualFee: totalFee,
    durationMinutes,
    durationText: formatDuration(durationMinutes),
    feeDetails
  };
}

export function formatDateTime(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
}

export function isDateInRange(date: Date, startDate: Date | null, endDate: Date | null): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  if (startDate) {
    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    if (d < s) return false;
  }
  
  if (endDate) {
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    if (d > e) return false;
  }
  
  return true;
}

export function getVehicleTypeName(type: string): string {
  const typeMap: Record<string, string> = {
    car: '小型汽车',
    truck: '货车',
    motorcycle: '摩托车',
    van: '面包车',
    bus: '客车'
  };
  return typeMap[type] || type;
}

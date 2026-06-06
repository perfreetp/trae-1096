import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Vehicle, Alert, FeeRecord, ShiftRecord, OperationLog, Device } from '../types';
import { mockVehicles, mockDevices, mockAlerts, mockFeeRecords, mockShiftRecord, mockOperationLogs } from '../data/mockData';

export interface AppState {
  vehicles: Vehicle[];
  devices: Device[];
  alerts: Alert[];
  feeRecords: FeeRecord[];
  operationLogs: OperationLog[];
  currentShift: ShiftRecord;
  currentOperator: {
    id: string;
    name: string;
    role: string;
  };
  selectedVehicle: Vehicle | null;
  activeTab: string;
  unacknowledgedAlerts: number;
  gateStates: Record<string, boolean>;
  lastCaptureTime: Date | null;
}

type ActionType =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SELECT_VEHICLE'; payload: Vehicle | null }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'REMOVE_VEHICLE'; payload: string }
  | { type: 'ADD_ALERT'; payload: Alert }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'ACKNOWLEDGE_ALL_ALERTS' }
  | { type: 'ADD_FEE_RECORD'; payload: FeeRecord }
  | { type: 'UPDATE_FEE_RECORD'; payload: FeeRecord }
  | { type: 'ADD_OPERATION_LOG'; payload: OperationLog }
  | { type: 'UPDATE_DEVICE'; payload: Device }
  | { type: 'COMPLETE_SHIFT'; payload: { endTime: Date; nextOperator: { id: string; name: string } } }
  | { type: 'UPDATE_SHIFT'; payload: Partial<ShiftRecord> }
  | { type: 'SET_GATE_STATE'; payload: { deviceId: string; isOpen: boolean } }
  | { type: 'SET_ALL_GATES'; payload: boolean }
  | { type: 'TRIGGER_CAPTURE' };

const FULL_PARKING_THRESHOLD = 95;
const CURRENT_OCCUPANCY = 86.4;

const loadAcknowledgedAlerts = (): string[] => {
  try {
    const stored = localStorage.getItem('parking_acknowledged_alerts');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveAcknowledgedAlerts = (ids: string[]) => {
  try {
    localStorage.setItem('parking_acknowledged_alerts', JSON.stringify(ids));
  } catch {}
};

const loadOperationLogTimestamps = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem('parking_oplog_timestamps');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveOperationLogTimestamps = (timestamps: Record<string, number>) => {
  try {
    localStorage.setItem('parking_oplog_timestamps', JSON.stringify(timestamps));
  } catch {}
};

const acknowledgedIds = loadAcknowledgedAlerts();

const initialAlerts = mockAlerts.map(alert => ({
  ...alert,
  acknowledged: alert.acknowledged || acknowledgedIds.includes(alert.id)
})).filter(alert => {
  if (alert.type === 'full_parking' && CURRENT_OCCUPANCY < FULL_PARKING_THRESHOLD) {
    return false;
  }
  return true;
});

const initialGateStates: Record<string, boolean> = {};
mockDevices.filter(d => d.type === 'gate').forEach(d => {
  initialGateStates[d.id] = false;
});

const initialState: AppState = {
  vehicles: mockVehicles,
  devices: mockDevices,
  alerts: initialAlerts,
  feeRecords: mockFeeRecords,
  operationLogs: mockOperationLogs,
  currentShift: mockShiftRecord,
  currentOperator: {
    id: 'op001',
    name: '张值班',
    role: '收费员'
  },
  selectedVehicle: null,
  activeTab: 'monitor',
  unacknowledgedAlerts: initialAlerts.filter(a => !a.acknowledged).length,
  gateStates: initialGateStates,
  lastCaptureTime: null
};

function appReducer(state: AppState, action: ActionType): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SELECT_VEHICLE':
      return { ...state, selectedVehicle: action.payload };

    case 'ADD_VEHICLE':
      return { ...state, vehicles: [...state.vehicles, action.payload] };

    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(v =>
          v.id === action.payload.id ? action.payload : v
        )
      };

    case 'REMOVE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(v => v.id !== action.payload)
      };

    case 'ADD_ALERT': {
      if (action.payload.type === 'full_parking' && CURRENT_OCCUPANCY < FULL_PARKING_THRESHOLD) {
        return state;
      }
      const existing = state.alerts.find(a => a.id === action.payload.id);
      if (existing) return state;
      const newAlerts = [action.payload, ...state.alerts];
      return {
        ...state,
        alerts: newAlerts,
        unacknowledgedAlerts: newAlerts.filter(a => !a.acknowledged).length
      };
    }

    case 'ACKNOWLEDGE_ALERT': {
      const updatedAlerts = state.alerts.map(a =>
        a.id === action.payload ? { ...a, acknowledged: true } : a
      );
      const newAckIds = [...new Set([...loadAcknowledgedAlerts(), action.payload])];
      saveAcknowledgedAlerts(newAckIds);
      return {
        ...state,
        alerts: updatedAlerts,
        unacknowledgedAlerts: updatedAlerts.filter(a => !a.acknowledged).length
      };
    }

    case 'ACKNOWLEDGE_ALL_ALERTS': {
      const allAckIds = state.alerts.filter(a => !a.acknowledged).map(a => a.id);
      const newAckIds = [...new Set([...loadAcknowledgedAlerts(), ...allAckIds])];
      saveAcknowledgedAlerts(newAckIds);
      return {
        ...state,
        alerts: state.alerts.map(a => ({ ...a, acknowledged: true })),
        unacknowledgedAlerts: 0
      };
    }

    case 'ADD_FEE_RECORD':
      return {
        ...state,
        feeRecords: [...state.feeRecords, action.payload]
      };

    case 'UPDATE_FEE_RECORD':
      return {
        ...state,
        feeRecords: state.feeRecords.map(f =>
          f.id === action.payload.id ? action.payload : f
        )
      };

    case 'ADD_OPERATION_LOG': {
      const dedupKey = `${action.payload.action}-${action.payload.detail}`;
      const timestamps = loadOperationLogTimestamps();
      const now = Date.now();
      if (timestamps[dedupKey] && now - timestamps[dedupKey] < 500) {
        return state;
      }
      timestamps[dedupKey] = now;
      saveOperationLogTimestamps(timestamps);
      return {
        ...state,
        operationLogs: [action.payload, ...state.operationLogs]
      };
    }

    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map(d =>
          d.id === action.payload.id ? action.payload : d
        )
      };

    case 'UPDATE_SHIFT':
      return {
        ...state,
        currentShift: { ...state.currentShift, ...action.payload }
      };

    case 'SET_GATE_STATE':
      return {
        ...state,
        gateStates: {
          ...state.gateStates,
          [action.payload.deviceId]: action.payload.isOpen
        }
      };

    case 'SET_ALL_GATES':
      const newGateStates: Record<string, boolean> = {};
      Object.keys(state.gateStates).forEach(id => {
        newGateStates[id] = action.payload;
      });
      return {
        ...state,
        gateStates: newGateStates
      };

    case 'TRIGGER_CAPTURE':
      return {
        ...state,
        lastCaptureTime: new Date()
      };

    case 'COMPLETE_SHIFT':
      const newShift: ShiftRecord = {
        id: `shift${Date.now()}`,
        operatorId: action.payload.nextOperator.id,
        operatorName: action.payload.nextOperator.name,
        startTime: action.payload.endTime,
        cashCollection: 0,
        electronicCollection: 0,
        totalCollection: 0,
        vehicleCount: 0,
        freePassCount: 0,
        status: 'active'
      };
      return {
        ...state,
        currentShift: newShift,
        currentOperator: {
          id: action.payload.nextOperator.id,
          name: action.payload.nextOperator.name,
          role: '收费员'
        }
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<ActionType>;
  addOperationLog: (action: string, detail: string, extra?: Partial<OperationLog>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const addOperationLog = (action: string, detail: string, extra?: Partial<OperationLog>) => {
    const log: OperationLog = {
      id: `log${Date.now()}`,
      operatorId: state.currentOperator.id,
      operatorName: state.currentOperator.name,
      action,
      detail,
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      ...extra
    };
    dispatch({ type: 'ADD_OPERATION_LOG', payload: log });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addOperationLog }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

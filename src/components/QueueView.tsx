import React, { useMemo, useEffect } from 'react';
import {
  List, ArrowUpCircle, ArrowDownCircle, Clock,
  Users, AlertTriangle, Car, Eye, FileCheck, ChevronRight,
  DollarSign, Settings
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime, getVehicleTypeName } from '../utils/helpers';
import type { Vehicle } from '../types';

const QueueView: React.FC = () => {
  const { state, dispatch } = useApp();

  const { entryVehicles, exitVehicles } = useMemo(() => {
    const entry = state.vehicles.filter(v => v.direction === 'in');
    const exit = state.vehicles.filter(v => v.direction === 'out' && !v.exitTime);
    return { entryVehicles: entry, exitVehicles: exit };
  }, [state.vehicles]);

  useEffect(() => {
    const offlineDevices = state.devices.filter(d => d.status === 'offline');
    offlineDevices.forEach(device => {
      const existingAlert = state.alerts.find(
        a => a.type === 'device_offline' && a.deviceId === device.id && !a.acknowledged
      );
      if (!existingAlert) {
        dispatch({
          type: 'ADD_ALERT',
          payload: {
            id: `alert${Date.now()}-${device.id}`,
            type: 'device_offline',
            severity: 'error',
            message: `${device.name} 设备离线`,
            deviceId: device.id,
            timestamp: new Date(),
            acknowledged: false
          }
        });
      }
    });
  }, [state.devices, state.alerts, dispatch]);

  useEffect(() => {
    const isCongested = entryVehicles.length >= 5 || exitVehicles.length >= 5;
    if (isCongested) {
      const existingCongestionAlert = state.alerts.find(
        a => a.type === 'congestion' && !a.acknowledged
      );
      if (!existingCongestionAlert) {
        dispatch({
          type: 'ADD_ALERT',
          payload: {
            id: `alert${Date.now()}-congestion`,
            type: 'congestion',
            severity: 'warning',
            message: `通道拥堵：入口${entryVehicles.length}辆，出口${exitVehicles.length}辆等待`,
            timestamp: new Date(),
            acknowledged: false
          }
        });
      }
    }
  }, [entryVehicles.length, exitVehicles.length, state.alerts, dispatch]);

  const getLaneStatus = (count: number) => {
    if (count >= 5) return { status: '拥堵', color: 'text-red-400 bg-red-500/20', barColor: 'bg-red-500' };
    if (count >= 3) return { status: '繁忙', color: 'text-yellow-400 bg-yellow-500/20', barColor: 'bg-yellow-500' };
    return { status: '畅通', color: 'text-green-400 bg-green-500/20', barColor: 'bg-green-500' };
  };

  const entryStatus = getLaneStatus(entryVehicles.length);
  const exitStatus = getLaneStatus(exitVehicles.length);

  const handleVehicleClick = (vehicle: Vehicle) => {
    dispatch({ type: 'SELECT_VEHICLE', payload: vehicle });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'plate' });
  };

  const handleViewMonitor = () => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'monitor' });
  };

  const renderVehicleCard = (vehicle: Vehicle, index: number) => (
    <div
      key={vehicle.id}
      className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-all cursor-pointer group"
      onClick={() => handleVehicleClick(vehicle)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center text-sm font-bold text-blue-400">
            {index + 1}
          </div>
          <div>
            <p className={`font-mono font-bold ${
              vehicle.hasPlate ? 'text-white' : 'text-orange-400'
            }`}>
              {vehicle.plateNumber || '无牌车'}
            </p>
            <p className="text-xs text-slate-400">
              {getVehicleTypeName(vehicle.vehicleType)} · {vehicle.color}
            </p>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={16} className="text-slate-400" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-500 flex items-center gap-1">
          <Clock size={10} />
          {formatDateTime(vehicle.entryTime)}
        </span>
        <span className="text-slate-500">{vehicle.lane}</span>
      </div>
    </div>
  );

  return (
    <div className="h-full flex gap-4 p-4">
      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <ArrowDownCircle size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  入口队列
                  <span className={`px-2 py-0.5 rounded text-xs ${entryStatus.color}`}>
                    {entryStatus.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">共 {entryVehicles.length} 辆等待</p>
              </div>
            </div>
            <button
              onClick={handleViewMonitor}
              className="px-3 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            >
              <Eye size={14} />
              查看监控
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>车道负载</span>
              <span>{entryVehicles.length} / 10</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${entryStatus.barColor} transition-all`}
                style={{ width: `${Math.min(entryVehicles.length * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {entryVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Car size={40} className="mb-2 opacity-30" />
              <p className="text-sm">入口暂无车辆排队</p>
            </div>
          ) : (
            entryVehicles.map((v, i) => renderVehicleCard(v, i))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <ArrowUpCircle size={20} className="text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  出口队列
                  <span className={`px-2 py-0.5 rounded text-xs ${exitStatus.color}`}>
                    {exitStatus.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">共 {exitVehicles.length} 辆等待</p>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'cashier' })}
              className="px-3 h-8 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            >
              <DollarSign size={14} />
              去收费
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>车道负载</span>
              <span>{exitVehicles.length} / 10</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${exitStatus.barColor} transition-all`}
                style={{ width: `${Math.min(exitVehicles.length * 10, 100)}%` }}
              ></div>
            </div>
          </div>

          {exitVehicles.length >= 5 && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-400">出口拥堵提醒</p>
                <p className="text-xs text-slate-400 mt-0.5">建议增开收费通道或加快处理速度</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {exitVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Car size={40} className="mb-2 opacity-30" />
              <p className="text-sm">出口暂无车辆排队</p>
            </div>
          ) : (
            exitVehicles.map((v, i) => renderVehicleCard(v, i))
          )}
        </div>
      </div>

      <div className="w-64 flex flex-col gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users size={16} className="text-blue-400" />
            队列统计
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">入口等待</span>
              <span className="font-mono font-bold text-green-400">{entryVehicles.length} 辆</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">出口等待</span>
              <span className="font-mono font-bold text-orange-400">{exitVehicles.length} 辆</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">等待超时</span>
              <span className="font-mono font-bold text-red-400">0 辆</span>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">总等待车辆</span>
                <span className="font-mono font-bold text-xl text-white">
                  {entryVehicles.length + exitVehicles.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <FileCheck size={16} className="text-purple-400" />
            快捷操作
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'plate' })}
              className="w-full h-9 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <FileCheck size={14} />
              车牌确认
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'control' })}
              className="w-full h-9 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Settings size={14} />
              远程控制
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'exception' })}
              className="w-full h-9 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <AlertTriangle size={14} />
              异常处理
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <List size={16} className="text-green-400" />
            车道状态
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-sm">入口1</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                畅通
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-sm">入口2</span>
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                畅通
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-sm">出口1</span>
              <span className="text-xs text-yellow-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                繁忙
              </span>
            </div>
            <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg">
              <span className="text-sm">出口2</span>
              <span className="text-xs text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                拥堵
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueView;

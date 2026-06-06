import React, { useState, useMemo } from 'react';
import {
  AlertTriangle, Check, AlertCircle,
  WifiOff, Car, Users, Clock, Bell, Filter
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime } from '../utils/helpers';
import type { Alert } from '../types';

const severityConfig = {
  info: { color: 'text-blue-400 bg-blue-500/20 border-blue-500/30', label: '提示' },
  warning: { color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30', label: '警告' },
  error: { color: 'text-orange-400 bg-orange-500/20 border-orange-500/30', label: '错误' },
  critical: { color: 'text-red-400 bg-red-500/20 border-red-500/30', label: '严重' }
};

const typeConfig: Record<string, { icon: React.ElementType; label: string }> = {
  device_offline: { icon: WifiOff, label: '设备离线' },
  full_parking: { icon: Car, label: '车位已满' },
  congestion: { icon: Users, label: '通道拥堵' },
  suspicious: { icon: AlertCircle, label: '可疑车辆' },
  system_error: { icon: AlertTriangle, label: '系统错误' }
};

const ExceptionView: React.FC = () => {
  const { state, dispatch, addOperationLog } = useApp();
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [showSuccessTip, setShowSuccessTip] = useState(false);

  const stats = useMemo(() => {
    const unacknowledged = state.alerts.filter(a => !a.acknowledged);
    return {
      total: unacknowledged.length,
      deviceOffline: unacknowledged.filter(a => a.type === 'device_offline').length,
      fullParking: unacknowledged.filter(a => a.type === 'full_parking').length,
      congestion: unacknowledged.filter(a => a.type === 'congestion').length,
      critical: unacknowledged.filter(a => a.severity === 'critical').length
    };
  }, [state.alerts]);

  const filteredAlerts = useMemo(() => {
    let alerts = [...state.alerts];
    
    if (severityFilter) {
      alerts = alerts.filter(a => a.severity === severityFilter);
    }
    
    return alerts.sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [state.alerts, severityFilter]);

  const handleAcknowledge = (alert: Alert) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alert.id });
    
    addOperationLog(
      '告警确认',
      `告警类型: ${typeConfig[alert.type]?.label || alert.type}, 内容: ${alert.message}`,
      { deviceId: alert.deviceId }
    );

    setShowSuccessTip(true);
    setTimeout(() => setShowSuccessTip(false), 1500);
  };

  const handleAcknowledgeAll = () => {
    dispatch({ type: 'ACKNOWLEDGE_ALL_ALERTS' });
    
    addOperationLog(
      '告警确认',
      '一键确认所有未处理告警'
    );

    setShowSuccessTip(true);
    setTimeout(() => setShowSuccessTip(false), 1500);
  };

  const parkingUsage = 86.4;
  const isFull = parkingUsage >= 95;

  return (
    <div className="h-full flex flex-col p-4">
      {showSuccessTip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <Check size={18} />
          <span>告警已确认</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">待处理告警</span>
            <div className={`p-2 rounded-lg ${
              stats.total > 5 ? 'bg-red-500/20' : 'bg-orange-500/20'
            }`}>
              <AlertTriangle size={18} className={stats.total > 5 ? 'text-red-400' : 'text-orange-400'} />
            </div>
          </div>
          <p className={`text-3xl font-bold ${
            stats.total > 5 ? 'text-red-400' : 'text-orange-400'
          }`}>
            {stats.total}
          </p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">设备离线</span>
            <div className="p-2 rounded-lg bg-red-500/20">
              <WifiOff size={18} className="text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.deviceOffline}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">通道拥堵</span>
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Users size={18} className="text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{stats.congestion}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">严重告警</span>
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertCircle size={18} className="text-red-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats.critical}</p>
        </div>
      </div>

      {isFull && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
              <Car size={20} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-400 mb-1">满位策略已触发</h4>
              <p className="text-sm text-slate-300 mb-2">
                当前车位使用率已达 <span className="text-red-400 font-bold">{parkingUsage}%</span>，
                建议启用以下策略：
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs">入口引导显示"车位已满"</span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">引导车辆至备用停车场</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">开启快捷收费通道</span>
              </div>
            </div>
            <button
              onClick={handleAcknowledgeAll}
              className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition-colors"
            >
              一键确认
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <Car size={16} className="text-blue-400" />
            车位使用情况
          </h4>
          <span className="text-sm text-slate-400">
            总车位: 500 | 已用: 432 | 空闲: 68
          </span>
        </div>
        <div className="relative h-4 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              parkingUsage >= 95 ? 'bg-red-500' :
              parkingUsage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${parkingUsage}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow">
              {parkingUsage}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell size={16} className="text-orange-400" />
              告警列表
            </h3>
            <span className="text-xs text-slate-400">
              共 {filteredAlerts.length} 条
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-8 px-2 bg-slate-900 border border-slate-600 rounded text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">全部级别</option>
                <option value="info">提示</option>
                <option value="warning">警告</option>
                <option value="error">错误</option>
                <option value="critical">严重</option>
              </select>
            </div>
            <button
              onClick={handleAcknowledgeAll}
              disabled={state.unacknowledgedAlerts === 0}
              className="px-3 h-8 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Check size={14} />
              全部确认
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <AlertTriangle size={48} className="mx-auto mb-3 opacity-30" />
                <p>暂无告警记录</p>
              </div>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const TypeIcon = typeConfig[alert.type]?.icon || AlertCircle;
              const sevConf = severityConfig[alert.severity];
              
              return (
                <div
                  key={alert.id}
                  className={`px-4 py-3 border-b border-slate-700/50 transition-colors ${
                    alert.acknowledged ? 'opacity-60 bg-slate-800/50' : 'hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${sevConf.color}`}>
                      <TypeIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.message}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs ${sevConf.color}`}>
                          {sevConf.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                          {typeConfig[alert.type]?.label || alert.type}
                        </span>
                        {!alert.acknowledged && (
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDateTime(alert.timestamp)}
                        </span>
                        {alert.deviceId && (
                          <span>设备ID: {alert.deviceId}</span>
                        )}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert)}
                        className="px-3 h-8 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-sm transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <Check size={14} />
                        确认
                      </button>
                    )}
                    {alert.acknowledged && (
                      <span className="text-xs text-green-400 flex items-center gap-1 flex-shrink-0">
                        <Check size={12} />
                        已处理
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ExceptionView;

import React, { useState } from 'react';
import { 
  AlertTriangle, CheckCircle, AlertCircle, XCircle, Info, 
  BellOff, Filter, Clock, MapPin, Check
} from 'lucide-react';
import { mockAlerts, parkingStats } from '../data/mockData';
import type { Alert } from '../types';

const ExceptionView: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'unack' | 'ack'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info': return <Info size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'critical': return <XCircle size={16} />;
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'critical': return 'text-red-500 bg-red-500/20 border-red-500/50';
    }
  };

  const getSeverityText = (severity: Alert['severity']) => {
    switch (severity) {
      case 'info': return '提示';
      case 'warning': return '警告';
      case 'error': return '错误';
      case 'critical': return '严重';
    }
  };

  const getTypeText = (type: Alert['type']) => {
    switch (type) {
      case 'device_offline': return '设备离线';
      case 'full_parking': return '车位已满';
      case 'congestion': return '拥堵提醒';
      case 'suspicious': return '异常车辆';
      case 'system_error': return '系统错误';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const acknowledgeAll = () => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unack' && a.acknowledged) return false;
    if (filter === 'ack' && !a.acknowledged) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    return true;
  });

  const unackCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;
  const errorCount = alerts.filter(a => a.severity === 'error' && !a.acknowledged).length;
  const warningCount = alerts.filter(a => a.severity === 'warning' && !a.acknowledged).length;

  const occupancyRate = (parkingStats.occupiedSpaces / parkingStats.totalSpaces * 100).toFixed(1);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" />
          异常处理
        </h2>
        <div className="flex items-center gap-4">
          {unackCount > 0 && (
            <button
              onClick={acknowledgeAll}
              className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-sm flex items-center gap-1.5"
            >
              <Check size={14} />
              全部确认
            </button>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">未处理:</span>
            <span className="text-red-400 font-bold">{unackCount}</span>
          </div>
        </div>
      </div>

      {/* 告警统计和满位策略 */}
      <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-800/50 border-b border-slate-700">
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-500" />
            <span className="text-xs text-slate-400">严重告警</span>
          </div>
          <p className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-500 blink' : 'text-slate-400'}`}>
            {criticalCount}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-xs text-slate-400">错误告警</span>
          </div>
          <p className={`text-2xl font-bold ${errorCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {errorCount}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-yellow-400" />
            <span className="text-xs text-slate-400">警告告警</span>
          </div>
          <p className={`text-2xl font-bold ${warningCount > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
            {warningCount}
          </p>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-3 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" />
              <span className="text-xs text-slate-400">车位使用情况</span>
            </div>
            <span className="text-sm font-medium">{occupancyRate}%</span>
          </div>
          <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                parseFloat(occupancyRate) >= 95 ? 'bg-red-500' :
                parseFloat(occupancyRate) >= 85 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${occupancyRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-500">
            <span>已用 {parkingStats.occupiedSpaces}</span>
            <span>空闲 {parkingStats.availableSpaces}</span>
            <span>总计 {parkingStats.totalSpaces}</span>
          </div>
          {parseFloat(occupancyRate) >= 90 && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
              <AlertTriangle size={12} className="inline mr-1" />
              满位策略已启用：入口显示屏提示"车位已满"，引导车辆至备用停车场
            </div>
          )}
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700 flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm">
          <Filter size={14} className="text-slate-400" />
          <span className="text-slate-400">筛选:</span>
        </div>
        <div className="flex bg-slate-700 rounded p-0.5">
          <button
            className={`px-3 py-1 rounded text-xs ${filter === 'all' ? 'bg-blue-500' : 'hover:bg-slate-600'}`}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={`px-3 py-1 rounded text-xs ${filter === 'unack' ? 'bg-blue-500' : 'hover:bg-slate-600'}`}
            onClick={() => setFilter('unack')}
          >
            未确认
          </button>
          <button
            className={`px-3 py-1 rounded text-xs ${filter === 'ack' ? 'bg-blue-500' : 'hover:bg-slate-600'}`}
            onClick={() => setFilter('ack')}
          >
            已确认
          </button>
        </div>
        <div className="flex bg-slate-700 rounded p-0.5">
          <button
            className={`px-3 py-1 rounded text-xs ${severityFilter === 'all' ? 'bg-blue-500' : 'hover:bg-slate-600'}`}
            onClick={() => setSeverityFilter('all')}
          >
            全部级别
          </button>
          <button
            className={`px-3 py-1 rounded text-xs ${severityFilter === 'critical' ? 'bg-red-500' : 'hover:bg-slate-600'}`}
            onClick={() => setSeverityFilter('critical')}
          >
            严重
          </button>
          <button
            className={`px-3 py-1 rounded text-xs ${severityFilter === 'error' ? 'bg-red-500/50' : 'hover:bg-slate-600'}`}
            onClick={() => setSeverityFilter('error')}
          >
            错误
          </button>
          <button
            className={`px-3 py-1 rounded text-xs ${severityFilter === 'warning' ? 'bg-yellow-500/50' : 'hover:bg-slate-600'}`}
            onClick={() => setSeverityFilter('warning')}
          >
            警告
          </button>
        </div>
      </div>

      {/* 告警列表 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`bg-slate-800 rounded-xl border p-4 transition-all ${
                alert.acknowledged 
                  ? 'border-slate-700 opacity-60' 
                  : getSeverityColor(alert.severity)
              } ${alert.severity === 'critical' && !alert.acknowledged ? 'ring-2 ring-red-500/50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                        {getSeverityText(alert.severity)}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                        {getTypeText(alert.type)}
                      </span>
                      {!alert.acknowledged && (
                        <span className="w-2 h-2 bg-red-500 rounded-full blink"></span>
                      )}
                    </div>
                    <p className="font-medium">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {alert.timestamp.toLocaleString('zh-CN')}
                      </span>
                      {alert.deviceId && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          设备ID: {alert.deviceId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.acknowledged ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle size={14} />
                      已确认
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Check size={14} />
                      确认
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <BellOff size={48} className="mx-auto mb-3 opacity-30" />
              <p>暂无符合条件的告警</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExceptionView;

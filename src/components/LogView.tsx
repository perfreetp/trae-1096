import React, { useState, useMemo } from 'react';
import {
  FileText, Search, Filter, X, Play, Clock, User,
  Car, Calendar, Tag
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime, isDateInRange } from '../utils/helpers';
import type { OperationLog } from '../types';

const actionTypes = [
  { value: '', label: '全部类型' },
  { value: '现金收费', label: '现金收费' },
  { value: '免费放行', label: '免费放行' },
  { value: '车牌修正', label: '车牌修正' },
  { value: '无牌车建档', label: '无牌车建档' },
  { value: '道闸控制', label: '道闸控制' },
  { value: '告警确认', label: '告警确认' },
  { value: '交接班', label: '交接班' },
  { value: '语音对讲', label: '语音对讲' }
];

const LogView: React.FC = () => {
  const { state } = useApp();
  const [plateNumber, setPlateNumber] = useState('');
  const [actionType, setActionType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReplayModal, setShowReplayModal] = useState(false);
  const [replayPlate, setReplayPlate] = useState('');
  const [replayLogs, setReplayLogs] = useState<OperationLog[]>([]);

  const filteredLogs = useMemo(() => {
    let logs = [...state.operationLogs];

    if (plateNumber.trim()) {
      const search = plateNumber.trim().toLowerCase();
      logs = logs.filter(l => 
        l.plateNumber?.toLowerCase().includes(search)
      );
    }

    if (actionType) {
      logs = logs.filter(l => l.action === actionType);
    }

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      logs = logs.filter(l => isDateInRange(l.timestamp, start, end));
    }

    return logs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [state.operationLogs, plateNumber, actionType, startDate, endDate]);

  const handleReplay = (plate: string) => {
    const vehicleLogs = state.operationLogs
      .filter(l => l.plateNumber === plate)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    setReplayPlate(plate);
    setReplayLogs(vehicleLogs);
    setShowReplayModal(true);
  };

  const clearFilters = () => {
    setPlateNumber('');
    setActionType('');
    setStartDate('');
    setEndDate('');
  };

  const hasFilters = plateNumber || actionType || startDate || endDate;

  return (
    <div className="h-full flex flex-col p-4">
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText size={16} className="text-blue-400" />
            操作日志查询
          </h3>
          <div className="text-sm text-slate-400">
            共 <span className="text-white font-mono">{filteredLogs.length}</span> 条记录
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Car size={12} />
              车牌号码
            </label>
            <div className="relative">
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="输入车牌号码"
                className="w-full h-9 px-3 pr-8 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              {plateNumber && (
                <button
                  onClick={() => setPlateNumber('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Tag size={12} />
              操作类型
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Calendar size={12} />
              开始日期
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
              <Calendar size={12} />
              结束日期
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              disabled={!hasFilters}
              className="h-9 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Filter size={14} />
              重置
            </button>
            <button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center gap-1">
              <Search size={14} />
              查询
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-700/50 text-sm text-slate-400 font-medium">
          <div className="col-span-2">操作时间</div>
          <div className="col-span-2">操作人</div>
          <div className="col-span-2">操作类型</div>
          <div className="col-span-2">车牌号码</div>
          <div className="col-span-4">操作详情</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-3 opacity-30" />
                <p>暂无符合条件的日志记录</p>
              </div>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-700/50 text-sm hover:bg-slate-700/30 transition-colors items-center"
              >
                <div className="col-span-2 text-slate-400 font-mono text-xs">
                  {formatDateTime(log.timestamp)}
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <User size={14} className="text-slate-500" />
                  {log.operatorName}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    log.action.includes('收费') ? 'bg-green-500/20 text-green-400' :
                    log.action.includes('放行') ? 'bg-orange-500/20 text-orange-400' :
                    log.action.includes('修正') || log.action.includes('建档') ? 'bg-blue-500/20 text-blue-400' :
                    log.action.includes('告警') ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-600 text-slate-300'
                  }`}>
                    {log.action}
                  </span>
                </div>
                <div className="col-span-2">
                  {log.plateNumber ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{log.plateNumber}</span>
                      <button
                        onClick={() => handleReplay(log.plateNumber!)}
                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400 hover:text-blue-300 transition-colors"
                        title="回放通行过程"
                      >
                        <Play size={12} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </div>
                <div className="col-span-4 text-slate-300 truncate" title={log.detail}>
                  {log.detail}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showReplayModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl w-[600px] max-h-[80vh] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Play size={20} className="text-blue-400" />
                  通行过程回放
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  车牌: <span className="font-mono text-white">{replayPlate}</span>
                </p>
              </div>
              <button
                onClick={() => setShowReplayModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {replayLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  暂无该车辆的通行记录
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700"></div>
                  
                  {replayLogs.map((log, index) => (
                    <div key={log.id} className="relative pl-10 pb-6 last:pb-0">
                      <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                        index === 0 ? 'bg-green-500 border-green-500' :
                        index === replayLogs.length - 1 ? 'bg-blue-500 border-blue-500' :
                        'bg-slate-800 border-slate-500'
                      }`}></div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            log.action.includes('收费') ? 'bg-green-500/20 text-green-400' :
                            log.action.includes('放行') ? 'bg-orange-500/20 text-orange-400' :
                            log.action.includes('修正') || log.action.includes('建档') ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-600 text-slate-300'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Clock size={12} />
                            {formatDateTime(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{log.detail}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          操作人: {log.operatorName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowReplayModal(false)}
                className="px-6 h-10 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogView;
